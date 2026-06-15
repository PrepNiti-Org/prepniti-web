export interface AuthResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    target_exam?: string;
}

export interface ForgotPasswordCredentials {
    email: string;
}

export interface ResetPasswordCredentials {
    token: string;
    new_password: string;
}