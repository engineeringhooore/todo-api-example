CREATE TABLE permission (
    id varchar NOT NULL PRIMARY KEY,
    "name" varchar NOT NULL,
    key varchar NOT NULL UNIQUE,
    description varchar NOT NULL DEFAULT ''
);
