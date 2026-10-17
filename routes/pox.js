const express = require('express');
const {XMLParser, XMLBuilder } = require('fast-xml-parser');
const logic = require('../businessLogic');
const businessLogic = require('../businessLogic');

const router = express.Router();

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
const builder = new XMLBuilder({ format: true, ignoreAttributes: false });

router.use(express.text({ type: ['application/xml', 'text/xml'] }));

const sendError = (res,error,status=500) => {
    const errorXml = builder.build({errorResponse: {message: error.message}});
    res.status(status).type('application/xml').send(errorXml);
}

router.post('/cities', (req,res) => {
    try {
        const result = logic.getAllCities();
        const responseXml = builder.build({
            citiesResponse: { cities: {city: result } }
        });
        res.type('application/xml').send(responseXml);
    } catch(error) {
        sendError(res,error)
    }
});

router.post('/hotels', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const request = xmlObj.hotelsRequest || {};

        let result;
        if (request.cityId) {
            result = logic.getHotelsByCity(request.cityId);
        } else {
            result = logic.getAllHotels();
        }

        const responseXml = builder.build({
            hotelsResponse: {
                hotels: {
                    holel: result
                }
            }
        });

        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error);
    }
});

router.post('/hotels/get', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const id = xmlObj.hotelRequest?.id;

        const hotel = logic.getHotelById(id);
        if (!hotel) throw new Error('Отель не найден');

        const responseXml = builder.build({ hotelResponse: { hotel } });
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error,404);
    }
});

router.post('/hotels/post', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const h = xmlObj.hotelAddRequest;
        const hotel = businessLogic.addHotel(h.cityId,h.name,h.address);
        const responseXml = builder.build({ hotelAddResponse: { hotel} });
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res, error, 400);
    }
});

router.post('/hotels/rooms', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const hotelId = xmlObj.roomsRequest?.hotelId;

        const rooms = logic.getRoomsByHotel(hotelId);
        const responseXml = builder.build({
            roomsResponse: {rooms: {room:rooms}}
        });
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error);
    }
});

router.post('/hotels/rooms/post', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const r = xmlObj.roomAddRequest;

        const room = businessLogic.addRoom(r.hotelId,r.roomNumber,r.type,r.pricePerNight);
        const responseXml = builder.build({roomAddResponse: {room}});
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error,400);
    }
});

router.post('/hotels/rooms/delete', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const id = xmlObj.roomDeleteRequest.id;

        const result = businessLogic.deleteRoom(id);
        const responseXml = builder.build({roomDeleteResponse: {result}});
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error,400);
    }
});

router.post('/hotels/available-rooms', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const r = xmlObj.availableRoomsRequest;
        if (!r) throw new Error('Ожидается \<availableRoomsRequest\>')

        const rooms = logic.getAvailableRooms(r.hotelId,r.checkIn,r.checkOut);
        const responseXml = builder.build({
            availableRoomsResponse: { rooms: { room: rooms } }
        });
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error,400);
    }
});

router.post('/bookings',(req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const b = xmlObj.bookingRequest;

        const booking = businessLogic.createBooking(b.roomId,b.guestName,b.guestEmail,b.checkIn,b.checkOut);
        const responseXml = builder.build({bookingResponse: {status: 'success', booking}});
        res.type('application/xml').send(responseXml);
    } catch(error) {
        sendError(res,error,400);
    }
});

router.post('/bookings/get', (req,res) => {
    try{
        const xmlObj = parser.parse(req.body);
        const id = xmlObj.bookingsRequest?.id;
        const booking = businessLogic.getBookingById(id);
        const responseXml = builder.build({bookingsResponse: {booking}});
        res.type('application/xml').send(responseXml);    
    } catch (error) {
        sendError(res,error,400);
    }
});

router.post('/bookings/cancel', (req,res) => {
    try {
        const xmlObj = parser.parse(req.body);
        const id = xmlObj.bookingCancelRequest?.id;
        const result = businessLogic.cancelBooking(id);
        const responseXml = builder.build({bookingCancelResponse: {result}});
        res.type('application/xml').send(responseXml);
    } catch (error) {
        sendError(res,error,400);
    }
});



module.exports = router;