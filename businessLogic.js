const db = require('./db');

const toIsoDate = (value,field) => {
    if (value == null || value === '') {
        throw new Error(`Не указано поле ${field}`);
    }

    if (typeof value === 'object') {
        value = value.text ?? value._ ?? value['#text'] ?? String(value);
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        throw new Error(`Некорректная дата в ${field}: ${value}`);
    }
    return d.toISOString().slice(0,10);

}

module.exports = {

    getAllCities: () => {
        return db.prepare('SELECT * FROM cities').all();
    },

    getHotelsByCity: (cityId) => {
        const query = `
            SELECT h.id, h.name, h.address, c.name as city_name, c.country
            FROM hotels h
            JOIN cities c ON h.city_id = c.id
            WHERE c.id = ?
        `;
        return db.prepare(query).all(cityId);
    },

    getAllHotels: () => {
        const query = `
            SELECT h.id, h.name, h.address, c.name as city_name, c.country
            FROM hotels h
            JOIN cities c ON h.city_id = c.id
        `;
        return db.prepare(query).all();
    },

    getHotelById: (id) => {
        if (!id) throw new Error('Не указан id отеля');
        const query = `
            SELECT h.id,h.name,h.address,c.name as city_name, c.country
            FROM hotels h
            JOIN cities c ON h.city_id = c.id
            WHERE h.id = ?
        `;
        return db.prepare(query).get(id);
    },

    addHotel: (cityId,name,address) => {
        if (!cityId || !name || !address) {
            throw new Error('cityId, name и address Обязательны!');
        }
        const city = db.prepare('SELECT id FROM cities WHERE id = ?').get(cityId);
        if (!city) throw new Error('Город не найден');

        const insertQuery = `
            INSERT INTO hotels (name, city_id, address)
            VALUES (?,?,?)
        `;

        const info = db.prepare(insertQuery).run(name,cityId,address);

        return { id: info.lastInsertRowid, name, address };
    },

    getRoomsByHotel: (hotelId) => {
        if (!hotelId) throw new Error('Не указан id отеля');
        return db.prepare('SELECT * FROM rooms WHERE hotel_id = ?').all(hotelId);
    },

    addRoom: (hotelId,roomNumber,type,pricePerNight) => {
        if (!hotelId || !roomNumber || !type || !pricePerNight) {
            throw new Error('hotelId, roomNumber, type, pricePerNight Обязательны');
        };

        const roomNumberStr = String(roomNumber).trim();
        const price = Number(pricePerNight);

        if (roomNumberStr === '') throw new Error('roomNumber не может быть пустым');
        if (!Number.isFinite(price) || price <= 0) throw new Error('Некорректная цена');

        const hotel = db.prepare('SELECT * FROM hotels WHERE id = ?').get(hotelId);
        if (!hotel) throw new Error('Отель не найден');

        if(db.prepare('SELECT room_number FROM rooms WHERE hotel_id = ? AND room_number = ?').get(hotelId,roomNumber)) {
            throw new Error('Номер уже есть в отеле');
        }

        const query = `
            INSERT INTO rooms (hotel_id,room_number,type,price_per_night)
            VALUES (?,?,?,?)
        `;

        const info = db.prepare(query).run(hotelId,roomNumberStr,type,price);

        return {id: info.lastInsertRowid, hotel_id: hotelId, room_number: roomNumberStr, type, price_per_night: price};
    },

    deleteRoom: (id) => {
        if (!id) throw new Error('id Обязателен');
        const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(id);

        if (result.changes === 0) {
            throw new Error('id не найден');
        }

        return {deleted: true, id};
    },

    getAvailableRooms: (hotelId,checkIn,checkOut) => {
        if(!hotelId || !checkIn || !checkOut) throw new Error(`
            Обязательно нужно указать hotelId, checkIn, checkOut
        `);
        
        const dateIn = toIsoDate(checkIn,'checkIn');
        const current = toIsoDate(Date.now(),'now');
        if (dateIn < current) throw new Error('Не живите прошлым...');
        const dateOut = toIsoDate(checkOut,'checkOut');

        if (dateIn >= dateOut) throw new Error('checkIn должен быть раньше checkOut');

        const query = `
            SELECT * FROM rooms
            WHERE hotel_id = ?
            AND id NOT IN (
                    SELECT room_id FROM bookings
                    WHERE status = 'confirmed'
                    AND (check_in < ? AND check_out > ?)
            )
        `;
        return db.prepare(query).all(hotelId,dateOut,dateIn);
    },

    createBooking: (roomId,guestName,guestEmail,checkIn,checkOut) => {
        if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
            throw new Error('roomId, guestName, guestEmail, checkIn и checkOut обязательны');
        }

        const dateIn = toIsoDate(checkIn,'checkIn');
        const current = toIsoDate(Date.now(),'now');
        if (dateIn < current) throw new Error('Не живите прошлым...');
        const dateOut = toIsoDate(checkOut,'checkOut');
        if (dateIn >= dateOut) throw new Error('checkIn должен быть раньше checkOut');

        const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
        if (!room) throw new Error('Номер не найден');
        

        const conflictQuery = `
            SELECT * FROM bookings
            WHERE room_id = ? AND status = 'confirmed'
            AND (check_in < ? AND check_out > ?)
        `;
        const conflict = db.prepare(conflictQuery).get(roomId,dateOut,dateIn);
        if (conflict) throw new Error('Номер уже забронирован на эти даты');

        const date1 = new Date(checkIn);
        const date2 = new Date(checkOut);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 *24));


        const totalPrice = diffDays * room.price_per_night;

        const insertQuery = `
            INSERT INTO bookings (room_id, guest_name, guest_email, check_in, check_out, total_price)
            VALUES (?,?,?,?,?,?)
        `;

        const info = db.prepare(insertQuery).run(roomId,guestName,guestEmail,dateIn,dateOut,totalPrice);

        return {
            id: info.lastInsertRowid,
            room_id: roomId,
            guest_name: guestName,
            guest_email: guestEmail,
            check_in: dateIn,
            check_out: dateOut,
            total_price: totalPrice,
            status: 'confirmed'
        };
    },

    getBookingById: (id) => {
        if (!id) throw new Error('id обязателен');
        return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    },

    cancelBooking: (id) => {
        if (!id) throw new Error('id обязателен');
        const info = db.prepare(
            "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status = 'confirmed'"
        ).run(id);

        if (info.changes === 0) throw new Error('Бронирование не найдено или уже отменено');

        return {id, status: 'cancelled'};
    }
};