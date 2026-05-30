package com.abhi.authProject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subject;
    private Integer semester; // can be null for all semesters
    private String branch;    // can be null for all branches
    private String visibility; // PUBLIC, STUDENT, BRANCH, ADMIN
    private String pdfUrl;
    private Date uploadedAt;

    public Note() {
        this.uploadedAt = new Date();
    }

    public Note(String title, String subject, Integer semester, String branch, String visibility, String pdfUrl) {
        this.title = title;
        this.subject = subject != null ? subject.toLowerCase() : "";
        this.semester = semester;
        this.branch = branch;
        this.visibility = visibility != null ? visibility.toUpperCase() : "PUBLIC";
        this.pdfUrl = pdfUrl;
        this.uploadedAt = new Date();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public Date getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Date uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @Override
    public String toString() {
        return "Note{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", subject='" + subject + '\'' +
                ", semester=" + semester +
                ", branch='" + branch + '\'' +
                ", visibility='" + visibility + '\'' +
                ", pdfUrl='" + pdfUrl + '\'' +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
