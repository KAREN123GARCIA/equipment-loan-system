INSERT INTO public.users (id, email, username, "passwordHash", "updatedAt") 
VALUES ('admin-001', 'admin@example.com', 'admin', '$2b$10$ul2rzgtFU8ikKqX9O5EU8ugPiBzJOynzDLbCuEWVH2URTkg6YiQYO', NOW())
ON CONFLICT (email) DO UPDATE SET username='admin', "passwordHash"='$2b$10$ul2rzgtFU8ikKqX9O5EU8ugPiBzJOynzDLbCuEWVH2URTkg6YiQYO';

INSERT INTO public.user_roles (id, "userId", role)
VALUES ('role-admin-001', 'admin-001', 'ADMIN')
ON CONFLICT ("userId", role) DO NOTHING;
