// Utility function to generate default avatar based on username
export const getDefaultAvatar = (username) => {
    if (!username) return 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=200';

    const initials = username.slice(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=667eea&color=fff&size=200&bold=true`;
};

// Get profile picture URL or default avatar
export const getProfilePicture = (user) => {
    if (user && user.profilePictureUrl) {
        return user.profilePictureUrl;
    }
    return getDefaultAvatar(user?.username);
};
