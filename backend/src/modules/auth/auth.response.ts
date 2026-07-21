export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;

    isEmailVerified: boolean;
    status: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponseDTO {
    user: UserResponseDTO;

    organization: {
        id: string;
        name: string;
        slug: string;
    }

    membership: {
        role: string;
    }
}