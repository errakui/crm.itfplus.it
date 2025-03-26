-- Verifica se esiste già l'enum Role
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        -- Creazione enum solo se non esiste
        CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
    END IF;
END $$; 