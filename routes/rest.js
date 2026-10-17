const express = require('express');
const logic = require('../businessLogic');

const router = express.Router();
router.use(express.json());

const handle = (fn) => (req,res) => {
    try {
        const result = fn(req,res);
        if (res.headersSent) return;
        res.json(result);
    } catch (error) {
        const status = /не найден/i.test(error.message) ? 404 : 400;
        res.status(status).json({error: error.message});
    }
};

router.get('/cities',handle(() => logic.getAllCities()));

router.get('/cities/:cityId/hotels', handle(req => 
    logic.getHotelsByCity(Number(req.params.cityId))
));

router.get('/hotels', handle(() => logic.getAllHotels()));

router.get('/hotels/:id', handle(req => (
    logic.getHotelById(req.params.id)
)));

router.post('/hotels', handle(req => {
    const {cityId, name, address} = req.body;
    return logic.addHotel(cityId,name,address);
}));

router.get('/hotels/:id/rooms', handle(req => 
    logic.getRoomsByHotel(Number(req.params.id))
));

router.get('/hotels/:id/available-rooms', handle(req => {
    const {checkIn, checkOut} = req.query;
    return logic.getAvailableRooms(Number(req.params.id),checkIn,checkOut);
}));

router.post('/hotels/:id/rooms', handle(req => {
    const hotelId = Number(req.params.id);
    const {roomNumber, type, pricePerNight} = req.body;
    return logic.addRoom(hotelId,roomNumber,type,pricePerNight);
}));

router.delete('/rooms/:id', handle((req,res) => {
    const result = logic.deleteRoom(Number(req.params.id));
    res.status(200).json(result);
}));

router.post('/bookings', handle((req,res) => {
    const {roomId, guestName, guestEmail, checkIn, checkOut} = req.body;
    const booking = logic.createBooking(roomId,guestName,guestEmail,checkIn,checkOut);
    res.status(201).json(booking);
}));

router.get('/bookings/:id', handle(req => 
    logic.getBookingById(Number(req.params.id))
));

router.delete('/bookings/:id', handle(req => 
    logic.cancelBooking(Number(req.params.id))
));

module.exports = router;


