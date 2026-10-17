const express = require('express');
const soap = require('soap');
const logic = require('../businessLogic');

const router = express.Router();

const service = {
  HotelBookingService: {
    HotelBookingPort: {

      getAllCities: (args, cb) => {
        try { cb({ cities: { city: logic.getAllCities() } }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getHotelsByCity: (args, cb) => {
        try { cb({ hotels: { hotel: logic.getHotelsByCity(args.cityId) } }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getAllHotels: (args, cb) => {
        try { cb({ hotels: { hotel: logic.getAllHotels() } }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getHotelById: (args, cb) => {
        try { cb({ hotel: logic.getHotelById(args.id) }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      addHotel: (args, cb) => {
        try {
          const hotel = logic.addHotel(args.cityId, args.name, args.address);
          cb({ hotel });
        } catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getRoomsByHotel: (args, cb) => {
        try { cb({ rooms: { room: logic.getRoomsByHotel(args.hotelId) } }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      addRoom: (args, cb) => {
        try {
          const room = logic.addRoom(args.hotelId, args.roomNumber, args.type, args.pricePerNight);
          cb({ room });
        } catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      deleteRoom: (args, cb) => {
        try { cb(logic.deleteRoom(args.id)); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getAvailableRooms: (args, cb) => {
        try {
          const rooms = logic.getAvailableRooms(args.hotelId, args.checkIn, args.checkOut);
          cb({ rooms: { room: rooms } });
        } catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      createBooking: (args, cb) => {
        try {
          const booking = logic.createBooking(
            args.roomId, args.guestName, args.guestEmail, args.checkIn, args.checkOut
          );
          cb({ booking });
        } catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      getBookingById: (args, cb) => {
        try { cb({ booking: logic.getBookingById(args.id) }); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      },

      cancelBooking: (args, cb) => {
        try { cb(logic.cancelBooking(args.id)); }
        catch (e) { cb({ Fault: { faultcode: 'Server', faultstring: e.message } }); }
      }
    }
  }
};

const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="HotelBookingService"
    targetNamespace="http://example.com/hotel-booking"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://example.com/hotel-booking"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <types>
    <xsd:schema targetNamespace="http://example.com/hotel-booking" elementFormDefault="qualified">

      <!-- ===== ТИПЫ ДАННЫХ ===== -->
      <xsd:complexType name="City">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="name" type="xsd:string"/>
          <xsd:element name="country" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:complexType name="Hotel">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="name" type="xsd:string"/>
          <xsd:element name="address" type="xsd:string" minOccurs="0"/>
          <xsd:element name="city_name" type="xsd:string"/>
          <xsd:element name="country" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:complexType name="Room">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="hotel_id" type="xsd:int"/>
          <xsd:element name="room_number" type="xsd:string"/>
          <xsd:element name="type" type="xsd:string"/>
          <xsd:element name="price_per_night" type="xsd:double"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:complexType name="Booking">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="room_id" type="xsd:int"/>
          <xsd:element name="guest_name" type="xsd:string"/>
          <xsd:element name="guest_email" type="xsd:string"/>
          <xsd:element name="check_in" type="xsd:string"/>
          <xsd:element name="check_out" type="xsd:string"/>
          <xsd:element name="total_price" type="xsd:double"/>
          <xsd:element name="status" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>

      <!-- ===== ЭЛЕМЕНТЫ ЗАПРОСОВ ===== -->
      <xsd:element name="getAllCitiesRequest">
        <xsd:complexType><xsd:sequence/></xsd:complexType>
      </xsd:element>
      <xsd:element name="getHotelsByCityRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="cityId" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getAllHotelsRequest">
        <xsd:complexType><xsd:sequence/></xsd:complexType>
      </xsd:element>
      <xsd:element name="getHotelByIdRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="addHotelRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="cityId" type="xsd:int"/>
          <xsd:element name="name" type="xsd:string"/>
          <xsd:element name="address" type="xsd:string"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getRoomsByHotelRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotelId" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="addRoomRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotelId" type="xsd:int"/>
          <xsd:element name="roomNumber" type="xsd:string"/>
          <xsd:element name="type" type="xsd:string"/>
          <xsd:element name="pricePerNight" type="xsd:double"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="deleteRoomRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getAvailableRoomsRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotelId" type="xsd:int"/>
          <xsd:element name="checkIn" type="xsd:string"/>
          <xsd:element name="checkOut" type="xsd:string"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="createBookingRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="roomId" type="xsd:int"/>
          <xsd:element name="guestName" type="xsd:string"/>
          <xsd:element name="guestEmail" type="xsd:string"/>
          <xsd:element name="checkIn" type="xsd:string"/>
          <xsd:element name="checkOut" type="xsd:string"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getBookingByIdRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="cancelBookingRequest">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>

      <!-- ===== ЭЛЕМЕНТЫ ОТВЕТОВ ===== -->
      <xsd:element name="getAllCitiesResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="cities">
            <xsd:complexType><xsd:sequence>
              <xsd:element name="city" type="tns:City" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence></xsd:complexType>
          </xsd:element>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getHotelsByCityResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotels">
            <xsd:complexType><xsd:sequence>
              <xsd:element name="hotel" type="tns:Hotel" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence></xsd:complexType>
          </xsd:element>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getAllHotelsResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotels">
            <xsd:complexType><xsd:sequence>
              <xsd:element name="hotel" type="tns:Hotel" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence></xsd:complexType>
          </xsd:element>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getHotelByIdResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotel" type="tns:Hotel"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="addHotelResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="hotel" type="tns:Hotel"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getRoomsByHotelResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="rooms">
            <xsd:complexType><xsd:sequence>
              <xsd:element name="room" type="tns:Room" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence></xsd:complexType>
          </xsd:element>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="addRoomResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="room" type="tns:Room"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="deleteRoomResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="deleted" type="xsd:boolean"/>
          <xsd:element name="id" type="xsd:int"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getAvailableRoomsResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="rooms">
            <xsd:complexType><xsd:sequence>
              <xsd:element name="room" type="tns:Room" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence></xsd:complexType>
          </xsd:element>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="createBookingResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="booking" type="tns:Booking"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="getBookingByIdResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="booking" type="tns:Booking"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="cancelBookingResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="status" type="xsd:string"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>

    </xsd:schema>
  </types>

  <!-- ===== MESSAGES ===== -->
  <message name="getAllCitiesIn"><part name="body" element="tns:getAllCitiesRequest"/></message>
  <message name="getAllCitiesOut"><part name="body" element="tns:getAllCitiesResponse"/></message>
  <message name="getHotelsByCityIn"><part name="body" element="tns:getHotelsByCityRequest"/></message>
  <message name="getHotelsByCityOut"><part name="body" element="tns:getHotelsByCityResponse"/></message>
  <message name="getAllHotelsIn"><part name="body" element="tns:getAllHotelsRequest"/></message>
  <message name="getAllHotelsOut"><part name="body" element="tns:getAllHotelsResponse"/></message>
  <message name="getHotelByIdIn"><part name="body" element="tns:getHotelByIdRequest"/></message>
  <message name="getHotelByIdOut"><part name="body" element="tns:getHotelByIdResponse"/></message>
  <message name="addHotelIn"><part name="body" element="tns:addHotelRequest"/></message>
  <message name="addHotelOut"><part name="body" element="tns:addHotelResponse"/></message>
  <message name="getRoomsByHotelIn"><part name="body" element="tns:getRoomsByHotelRequest"/></message>
  <message name="getRoomsByHotelOut"><part name="body" element="tns:getRoomsByHotelResponse"/></message>
  <message name="addRoomIn"><part name="body" element="tns:addRoomRequest"/></message>
  <message name="addRoomOut"><part name="body" element="tns:addRoomResponse"/></message>
  <message name="deleteRoomIn"><part name="body" element="tns:deleteRoomRequest"/></message>
  <message name="deleteRoomOut"><part name="body" element="tns:deleteRoomResponse"/></message>
  <message name="getAvailableRoomsIn"><part name="body" element="tns:getAvailableRoomsRequest"/></message>
  <message name="getAvailableRoomsOut"><part name="body" element="tns:getAvailableRoomsResponse"/></message>
  <message name="createBookingIn"><part name="body" element="tns:createBookingRequest"/></message>
  <message name="createBookingOut"><part name="body" element="tns:createBookingResponse"/></message>
  <message name="getBookingByIdIn"><part name="body" element="tns:getBookingByIdRequest"/></message>
  <message name="getBookingByIdOut"><part name="body" element="tns:getBookingByIdResponse"/></message>
  <message name="cancelBookingIn"><part name="body" element="tns:cancelBookingRequest"/></message>
  <message name="cancelBookingOut"><part name="body" element="tns:cancelBookingResponse"/></message>

  <!-- ===== PORT TYPE ===== -->
  <portType name="HotelBookingPortType">
    <operation name="getAllCities"><input message="tns:getAllCitiesIn"/><output message="tns:getAllCitiesOut"/></operation>
    <operation name="getHotelsByCity"><input message="tns:getHotelsByCityIn"/><output message="tns:getHotelsByCityOut"/></operation>
    <operation name="getAllHotels"><input message="tns:getAllHotelsIn"/><output message="tns:getAllHotelsOut"/></operation>
    <operation name="getHotelById"><input message="tns:getHotelByIdIn"/><output message="tns:getHotelByIdOut"/></operation>
    <operation name="addHotel"><input message="tns:addHotelIn"/><output message="tns:addHotelOut"/></operation>
    <operation name="getRoomsByHotel"><input message="tns:getRoomsByHotelIn"/><output message="tns:getRoomsByHotelOut"/></operation>
    <operation name="addRoom"><input message="tns:addRoomIn"/><output message="tns:addRoomOut"/></operation>
    <operation name="deleteRoom"><input message="tns:deleteRoomIn"/><output message="tns:deleteRoomOut"/></operation>
    <operation name="getAvailableRooms"><input message="tns:getAvailableRoomsIn"/><output message="tns:getAvailableRoomsOut"/></operation>
    <operation name="createBooking"><input message="tns:createBookingIn"/><output message="tns:createBookingOut"/></operation>
    <operation name="getBookingById"><input message="tns:getBookingByIdIn"/><output message="tns:getBookingByIdOut"/></operation>
    <operation name="cancelBooking"><input message="tns:cancelBookingIn"/><output message="tns:cancelBookingOut"/></operation>
  </portType>

  <!-- ===== BINDING ===== -->
  <binding name="HotelBookingBinding" type="tns:HotelBookingPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="getAllCities"><soap:operation soapAction="getAllCities"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getHotelsByCity"><soap:operation soapAction="getHotelsByCity"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getAllHotels"><soap:operation soapAction="getAllHotels"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getHotelById"><soap:operation soapAction="getHotelById"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="addHotel"><soap:operation soapAction="addHotel"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getRoomsByHotel"><soap:operation soapAction="getRoomsByHotel"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="addRoom"><soap:operation soapAction="addRoom"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="deleteRoom"><soap:operation soapAction="deleteRoom"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getAvailableRooms"><soap:operation soapAction="getAvailableRooms"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="createBooking"><soap:operation soapAction="createBooking"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="getBookingById"><soap:operation soapAction="getBookingById"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
    <operation name="cancelBooking"><soap:operation soapAction="cancelBooking"/><input><soap:body use="literal"/></input><output><soap:body use="literal"/></output></operation>
  </binding>

  <!-- ===== SERVICE ===== -->
  <service name="HotelBookingService">
    <port name="HotelBookingPort" binding="tns:HotelBookingBinding">
      <soap:address location="http://localhost:3000/soap"/>
    </port>
  </service>

</definitions>`;

soap.listen(router, '/', service, wsdl);

module.exports = router;