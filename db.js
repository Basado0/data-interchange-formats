const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname,'hotels_booking.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        country TEXT NOT NULL DEFAULT 'Россия'
    );

    CREATE TABLE IF NOT EXISTS hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT NOT NULL,
        city_id     INTEGER NOT NULL,
        address     TEXT,
        FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS rooms (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id    INTEGER NIT NULL,
        room_number TEXT NOT NULL,
        type        TEXT NOT NULL,
        price_per_night     REAL NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id     INTEGER NOT NULL,
        guest_name  TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        check_in    TEXT NOT NULL CHECK (check_in LIKE '____-__-__'),
        check_out    TEXT NOT NULL CHECK (check_out LIKE '____-__-__'),
        total_price  REAL NOT NULL,
        status      TEXT DEFAULT 'confirmed'
            CHECK (status IN ('confirmed','pending','cancelled')),
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        CHECK (check_out > check_in)
    );

`);

module.exports = db;