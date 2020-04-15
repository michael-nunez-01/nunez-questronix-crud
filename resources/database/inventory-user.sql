/*
This user is set to use the "inventory" table as described by the
"inventory-structure.sql" file.
*/

CREATE USER 'inventory'@'localhost' IDENTIFIED BY '123';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON `inventory`.`items`
    TO 'inventory'@'localhost';
FLUSH PRIVILEGES;
