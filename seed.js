const db = require('./db');

db.exec(`
        DELETE FROM bookings;
        DELETE FROM rooms;
        DELETE FROM hotels;
        DELETE FROM cities;
        DELETE FROM sqlite_sequence;
`);

const insertCity = db.prepare('INSERT INTO cities (name,country) VALUES (?,?)');
const insertHotel = db.prepare('INSERT INTO hotels (name,city_id,address) VALUES (?,?,?)');
const insertRoom = db.prepare(`
    INSERT INTO rooms (hotel_id,room_number,type,price_per_night)
    VALUES (?,?,?,?)
`);
const insertBooking = db.prepare(`
    INSERT INTO bookings (room_id,guest_name,guest_email,check_in,check_out,total_price,status)
    VALUES (?,?,?,?,?,?,?)
`);

const citiesData = [
  { key: 'msk', name: 'Москва',            country: 'Россия' },
  { key: 'sch', name: 'Сочи',              country: 'Россия' },
  { key: 'spb', name: 'Санкт-Петербург',   country: 'Россия' },
];

const hotelsData = [
  { city: 'msk', name: 'Гранд Отель',         address: 'ул. Тверская, 1' },
  { city: 'sch', name: 'Приморская Ривьера',  address: 'ул. Морская, 15' },
  { city: 'spb', name: 'Северная Столица',    address: 'Невский проспект, 10' },
];

const roomsData = [
  { hotel: 'Гранд Отель',        room_number: '101', type: 'Single', price_per_night: 5000  },
  { hotel: 'Гранд Отель',        room_number: '102', type: 'Double', price_per_night: 8000  },
  { hotel: 'Приморская Ривьера', room_number: 'A1',  type: 'Double', price_per_night: 6000  },
  { hotel: 'Северная Столица',   room_number: 'S1',  type: 'Suite',  price_per_night: 15000 },
];

const bookingsData = [
  { hotel: 'Гранд Отель', room_number: '101', guest_name: 'Иван Петров',   guest_email: 'ivan@example.com',
    check_in: '2026-11-01', check_out: '2026-11-05', status: 'confirmed' },
  { hotel: 'Гранд Отель', room_number: '102', guest_name: 'Анна Смирнова', guest_email: 'anna@example.com',
    check_in: '2026-12-20', check_out: '2026-12-27', status: 'confirmed' },
  { hotel: 'Приморская Ривьера', room_number: 'A1', guest_name: 'Олег Кузнецов', guest_email: 'oleg@example.com',
    check_in: '2026-11-15', check_out: '2026-11-20', status: 'pending'   },
];

function nightsBetween(checkIn,checkOut) {
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.round(ms / (1000 * 60 * 60 * 24));
};

const seedDatabase = db.transaction(() => {
    const cityIdByKey = {};
    for (const c of citiesData) {
        cityIdByKey[c.key] = insertCity.run(c.name,c.country).lastInsertRowid;
    }

    const hotelIdByName = {};
    for (const h of hotelsData) {
        const cityId = cityIdByKey[h.city];
        if (!cityId) throw new Error(`Неизвестный город: ${h.city}`);
        hotelIdByName[h.name] = insertHotel.run(h.name,cityId,h.address).lastInsertRowid;
    }

    const roomIdByKey = {};     
    const roomPriceByKey = {};   
    for (const r of roomsData) {
        const hotelId = hotelIdByName[r.hotel];
        if (!hotelId) throw new Error(`Неизвестный отель: ${r.hotel}`);
        const id = insertRoom.run(hotelId, r.room_number, r.type, r.price_per_night).lastInsertRowid;
        const key = `${r.hotel}|${r.room_number}`;
        roomIdByKey[key] = id;
        roomPriceByKey[key] = r.price_per_night;
    }

    for (const b of bookingsData) {
        const key = `${b.hotel}|${b.room_number}`;
        const roomId = roomIdByKey[key];
        if (roomId == null) throw new Error(`Неизвестный номер: ${key}`);

        const nights = nightsBetween(b.check_in, b.check_out);
        if (nights <= 0) {
        throw new Error(`Некорректные даты для брони (${b.room_number}): ${b.check_in} → ${b.check_out}`);
        }
        const totalPrice = nights * roomPriceByKey[key];

        insertBooking.run(
            roomId,
            b.guest_name,
            b.guest_email,
            b.check_in,
            b.check_out,
            totalPrice,
            b.status
        );
    }
});

seedDatabase();