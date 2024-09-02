CREATE TABLE todo (
    id varchar NOT NULL PRIMARY KEY,
    note varchar NOT NULL DEFAULT '',
    attachment varchar NOT NULL DEFAULT '',
    date_added timestamp with time zone NOT NULL DEFAULT now()
);
