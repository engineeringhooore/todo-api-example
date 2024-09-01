CREATE TABLE role_permission (
    role_id varchar NOT NULL,
    permission_id varchar NOT NULL,
    FOREIGN KEY (role_id) REFERENCES "role"(id),
    FOREIGN KEY (permission_id) REFERENCES permission(id)
);
