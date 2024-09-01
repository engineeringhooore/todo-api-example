CREATE TABLE auth_role (
    auth_id varchar NOT NULL,
    role_id varchar NOT NULL,
    FOREIGN KEY (auth_id) REFERENCES auth(id),
    FOREIGN KEY (role_id) REFERENCES "role"(id)
);
