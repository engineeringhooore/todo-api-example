CREATE TABLE auth (
    id varchar NOT NULL PRIMARY KEY,
    username varchar NOT NULL UNIQUE,
    password varchar NOT NULL,
    date_added timestamp with time zone NOT NULL DEFAULT now()
);
