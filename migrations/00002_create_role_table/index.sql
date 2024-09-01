CREATE TABLE role (
    id varchar NOT NULL PRIMARY KEY,
    "name" varchar NOT NULL,
    key varchar NOT NULL UNIQUE,
    assign_to_new_user boolean NOT NULL DEFAULT false
);
