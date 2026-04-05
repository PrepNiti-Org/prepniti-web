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
}