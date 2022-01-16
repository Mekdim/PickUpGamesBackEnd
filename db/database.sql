CREATE TABLE  Players(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    uid VARCHAR,
    address VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    phone_number VARCHAR(16),
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
CREATE TABLE   Hosts(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    uid VARCHAR,
    address VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    phone_number VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
--/*pitch type Football field for now
--  we can also use some other libraries for lat/long location*/
CREATE TABLE   Pitch(
    id SERIAL PRIMARY KEY,
    host_id Integer REFERENCES Players (id),
    name VARCHAR(100),
    type VARCHAR(100),
    address VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    description VARCHAR(250),
    price NUMERIC,
    capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
CREATE TYPE DaysOfWeek AS ENUM ('monday','tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

CREATE TABLE OpeningHours (
    id SERIAL PRIMARY KEY,
    pitch_id Integer REFERENCES Pitch (id),
    dayOfWeek DaysOfWeek,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);

--/* Availability - Fully booked, etc */
CREATE TABLE  Sessions (
    id SERIAL PRIMARY KEY,
    pitch_id Integer REFERENCES Pitch (id),
    name VARCHAR(100),
    date TIMESTAMPTZ,
    start_time  TIME ,
    end_time TIME ,
    duration Numeric,
    number_of_players INTEGER,
    Availability VARCHAR(50),
    reservation_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
CREATE TABLE session_members(
    id SERIAL PRIMARY KEY,
    session_id Integer REFERENCES Sessions (id),
    player_id Integer REFERENCES Players (id),
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
--/* type can be person image or pitch image and image id is players id or pitch id*/
CREATE TABLE   Pictures(
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(250),
    image_type VARCHAR(50),
    image_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);

CREATE TABLE Notifications(
    id SERIAL PRIMARY KEY,
    type VARCHAR(20),
    playerId Integer REFERENCES Players (id),
    entityId Integer,
    seen BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
CREATE TABLE Tokens(
    id SERIAL PRIMARY KEY,
    accessToken VARCHAR,
    refreshToken VARCHAR,
    uid VARCHAR,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
CREATE TABLE InvitationCodes(
    id SERIAL PRIMARY KEY,
    TYPE VARCHAR,
    invitationCode  VARCHAR,
    playerId VARCHAR ,
    created_at TIMESTAMPTZ DEFAULT current_timestamp,
    updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
