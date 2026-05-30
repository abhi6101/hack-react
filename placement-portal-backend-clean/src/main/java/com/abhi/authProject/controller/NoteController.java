package com.abhi.authProject.controller;

import com.abhi.authProject.model.Note;
import com.abhi.authProject.repo.NoteRepository;
import com.abhi.authProject.repo.UserRepo;
import com.abhi.authProject.model.Users;
import com.abhi.authProject.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepo userRepo;
    private final FileStorageService fileStorageService;

    @Autowired
    public NoteController(NoteRepository noteRepository, UserRepo userRepo, FileStorageService fileStorageService) {
        this.noteRepository = noteRepository;
        this.userRepo = userRepo;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Retrieves all study notes filtered dynamically by visibility criteria
     * matching the user's login session.
     */
    @GetMapping("/notes")
    public ResponseEntity<List<Note>> getNotes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName());

        List<Note> allNotes = noteRepository.findAllByOrderByUploadedAtDesc();

        if (!isAuthenticated) {
            // Unauthenticated Guest: Can ONLY see PUBLIC notes
            List<Note> guestNotes = allNotes.stream()
                    .filter(note -> "PUBLIC".equalsIgnoreCase(note.getVisibility()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(guestNotes);
        }

        // Authenticated Session: Check role
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                               a.getAuthority().equals("ROLE_SUPER_ADMIN") ||
                               a.getAuthority().equals("ROLE_COMPANY_ADMIN") ||
                               a.getAuthority().equals("ROLE_DEPT_ADMIN"));

        if (isAdmin) {
            // Admins can see absolutely all notes (including ADMIN drafts)
            return ResponseEntity.ok(allNotes);
        }

        // Standard Registered Student:
        Users student = userRepo.findByComputerCodeOrUsername(auth.getName()).orElse(null);
        if (student == null) {
            // Fallback if user profile not resolved
            List<Note> guestNotes = allNotes.stream()
                    .filter(note -> "PUBLIC".equalsIgnoreCase(note.getVisibility()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(guestNotes);
        }

        String studentBranch = student.getBranch();
        Integer studentSem = student.getSemester();

        List<Note> studentNotes = allNotes.stream()
                .filter(note -> {
                    String vis = note.getVisibility();
                    if ("PUBLIC".equalsIgnoreCase(vis) || "STUDENT".equalsIgnoreCase(vis)) {
                        return true;
                    }
                    if ("BRANCH".equalsIgnoreCase(vis)) {
                        // Check if note belongs to student's branch/semester (or has no specific filters)
                        boolean branchMatch = note.getBranch() == null || note.getBranch().isEmpty() ||
                                             (studentBranch != null && studentBranch.trim().equalsIgnoreCase(note.getBranch().trim()));
                        boolean semMatch = note.getSemester() == null || note.getSemester().equals(0) ||
                                           (studentSem != null && studentSem.equals(note.getSemester()));
                        return branchMatch && semMatch;
                    }
                    return false; // ADMIN only drafts are hidden from students
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(studentNotes);
    }

    /**
     * Uploads notes PDF to Google Drive and creates note meta record (Admin only).
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('DEPT_ADMIN') or hasRole('COMPANY_ADMIN')")
    @PostMapping(value = "/notes/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadNote(
            @RequestParam("title") String title,
            @RequestParam("subject") String subject,
            @RequestParam(value = "semester", required = false) Integer semester,
            @RequestParam(value = "branch", required = false) String branch,
            @RequestParam("visibility") String visibility,
            @RequestParam("file") MultipartFile file) {
        try {
            // Upload to Google Drive using existing FileStorageService
            String downloadUrl = fileStorageService.uploadFileToDrive(file);

            Note note = new Note(title, subject, semester, branch, visibility, downloadUrl);
            Note savedNote = noteRepository.save(note);
            return ResponseEntity.ok(savedNote);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload notes PDF: " + e.getMessage());
        }
    }

    /**
     * Deletes a notes meta record (Admin only).
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('DEPT_ADMIN') or hasRole('COMPANY_ADMIN')")
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        if (!noteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        noteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Streams the note PDF content securely, verifying visibility clearance.
     */
    @GetMapping("/notes/download/{id}")
    public ResponseEntity<?> downloadNote(@PathVariable Long id) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note == null) {
            return ResponseEntity.notFound().build();
        }

        // SECURITY CHECK: Verify if current session can see this note
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName());
        String vis = note.getVisibility();

        boolean hasAccess = false;

        if ("PUBLIC".equalsIgnoreCase(vis)) {
            hasAccess = true;
        } else if (isAuthenticated) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN") ||
                                   a.getAuthority().equals("ROLE_COMPANY_ADMIN") ||
                                   a.getAuthority().equals("ROLE_DEPT_ADMIN"));

            if (isAdmin) {
                hasAccess = true;
            } else {
                // Registered Student
                Users student = userRepo.findByComputerCodeOrUsername(auth.getName()).orElse(null);
                if (student != null) {
                    if ("STUDENT".equalsIgnoreCase(vis)) {
                        hasAccess = true;
                    } else if ("BRANCH".equalsIgnoreCase(vis)) {
                        String studentBranch = student.getBranch();
                        Integer studentSem = student.getSemester();

                        boolean branchMatch = note.getBranch() == null || note.getBranch().isEmpty() ||
                                             (studentBranch != null && studentBranch.trim().equalsIgnoreCase(note.getBranch().trim()));
                        boolean semMatch = note.getSemester() == null || note.getSemester().equals(0) ||
                                           (studentSem != null && studentSem.equals(note.getSemester()));
                        hasAccess = branchMatch && semMatch;
                    }
                }
            }
        }

        if (!hasAccess) {
            return ResponseEntity.status(403).body("Unauthorized: You do not have permission to view this note.");
        }

        String fileUrl = note.getPdfUrl();
        if (fileUrl == null || !fileUrl.startsWith("http")) {
            return ResponseEntity.notFound().build();
        }

        // Extract Google Drive File ID
        String fileId = null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("/d/([^/&?]+)");
        java.util.regex.Matcher matcher = pattern.matcher(fileUrl);
        if (matcher.find()) {
            fileId = matcher.group(1);
        } else {
            java.util.regex.Pattern pattern2 = java.util.regex.Pattern.compile("[?&]id=([^/&?]+)");
            java.util.regex.Matcher matcher2 = pattern2.matcher(fileUrl);
            if (matcher2.find()) {
                fileId = matcher2.group(1);
            }
        }

        if (fileId == null) {
            return ResponseEntity.badRequest().body("Malformed Google Drive link resolved.");
        }

        try {
            InputStream inputStream = fileStorageService.getFileStream(fileId);
            InputStreamResource resource = new InputStreamResource(inputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + note.getTitle() + ".pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving file stream: " + e.getMessage());
        }
    }
}
