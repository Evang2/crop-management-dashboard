--
-- File generated with SQLiteStudio v3.4.17 on Thu May 15 12:03:13 2025
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: sensor_data
CREATE TABLE IF NOT EXISTS sensor_data (
    id           INTEGER  NOT NULL,
    N            FLOAT,
    P            FLOAT,
    K            FLOAT,
    temperature  FLOAT,
    humidity     FLOAT,
    soilMoisture FLOAT,
    timestamp    DATETIME,
    PRIMARY KEY (
        id
    )
);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
