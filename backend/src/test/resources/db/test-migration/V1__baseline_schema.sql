CREATE TABLE app_user (
    user_id uuid NOT NULL,
    user_name varchar(50) NOT NULL,
    email varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    CONSTRAINT pk_app_user PRIMARY KEY (user_id),
    CONSTRAINT uq_app_user_email UNIQUE (email)
);

CREATE TABLE poi (
    id bigserial NOT NULL,
    places_id text NOT NULL,
    CONSTRAINT pk_poi PRIMARY KEY (id),
    CONSTRAINT uq_poi_places_id UNIQUE (places_id)
);

CREATE TABLE trip (
    id bigserial NOT NULL,
    user_id uuid NOT NULL,
    title varchar(255) NOT NULL,
    duration integer NOT NULL,
    start_date date,
    CONSTRAINT pk_trip PRIMARY KEY (id),
    CONSTRAINT ck_trip_duration CHECK (duration >= 1 AND duration <= 15)
);

CREATE TABLE trip_day (
    id bigserial NOT NULL,
    trip_id bigint NOT NULL,
    day_number integer NOT NULL,
    CONSTRAINT pk_trip_day PRIMARY KEY (id),
    CONSTRAINT uq_trip_day_trip_id_day_number UNIQUE (trip_id, day_number)
);

CREATE TABLE itinerary (
    id bigserial NOT NULL,
    trip_day_id bigint NOT NULL,
    poi_id bigint NOT NULL,
    visit_order integer NOT NULL,
    travel_method text NOT NULL DEFAULT 'TRAVEL_MODE_UNSPECIFIED',
    CONSTRAINT pk_itinerary PRIMARY KEY (id),
    CONSTRAINT uq_itinerary_trip_day_id_visit_order UNIQUE (trip_day_id, visit_order),
    CONSTRAINT ck_itinerary_travel_method CHECK (
        travel_method IN (
            'TRAVEL_MODE_UNSPECIFIED',
            'DRIVE',
            'BICYCLE',
            'WALK',
            'TWO_WHEELER',
            'TRANSIT'
        )
    )
);

CREATE TABLE todo_list (
    id bigserial NOT NULL,
    user_id uuid NOT NULL,
    start_date date,
    end_date date,
    CONSTRAINT pk_todo_list PRIMARY KEY (id),
    CONSTRAINT ck_todo_list_start_date_lte_end_date CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

CREATE TABLE todo_item (
    id bigserial NOT NULL,
    todo_list_id bigint NOT NULL,
    poi_id bigint NOT NULL,
    priority text NOT NULL DEFAULT 'medium',
    CONSTRAINT pk_todo_item PRIMARY KEY (id),
    CONSTRAINT ck_todo_item_priority CHECK (priority IN ('high', 'medium', 'low'))
);

CREATE TABLE bookmark_category (
    id bigserial NOT NULL,
    user_id uuid NOT NULL,
    category_name varchar(20) NOT NULL,
    CONSTRAINT pk_bookmark_category PRIMARY KEY (id),
    CONSTRAINT uq_bookmark_category_user_id_category_name UNIQUE (user_id, category_name),
    CONSTRAINT uq_bookmark_category_id_user_id UNIQUE (id, user_id)
);

CREATE TABLE bookmark (
    id bigserial NOT NULL,
    user_id uuid NOT NULL,
    poi_id bigint NOT NULL,
    custom_category bigint,
    CONSTRAINT pk_bookmark PRIMARY KEY (id),
    CONSTRAINT uq_bookmark_user_id_poi_id UNIQUE (user_id, poi_id)
);

ALTER TABLE todo_list
    ADD CONSTRAINT fk_todo_list_app_user_id
    FOREIGN KEY (user_id)
    REFERENCES app_user (user_id)
    ON DELETE CASCADE;

ALTER TABLE todo_item
    ADD CONSTRAINT fk_todo_item_todo_list_id
    FOREIGN KEY (todo_list_id)
    REFERENCES todo_list (id)
    ON DELETE CASCADE;

ALTER TABLE todo_item
    ADD CONSTRAINT fk_todo_item_poi_id
    FOREIGN KEY (poi_id)
    REFERENCES poi (id);

ALTER TABLE trip
    ADD CONSTRAINT fk_trip_app_user_id
    FOREIGN KEY (user_id)
    REFERENCES app_user (user_id)
    ON DELETE CASCADE;

ALTER TABLE trip_day
    ADD CONSTRAINT fk_trip_day_trip_id
    FOREIGN KEY (trip_id)
    REFERENCES trip (id)
    ON DELETE CASCADE;

ALTER TABLE itinerary
    ADD CONSTRAINT fk_itinerary_trip_day_id
    FOREIGN KEY (trip_day_id)
    REFERENCES trip_day (id)
    ON DELETE CASCADE;

ALTER TABLE itinerary
    ADD CONSTRAINT fk_itinerary_poi_id
    FOREIGN KEY (poi_id)
    REFERENCES poi (id);

ALTER TABLE bookmark_category
    ADD CONSTRAINT fk_bookmark_category_app_user_id
    FOREIGN KEY (user_id)
    REFERENCES app_user (user_id)
    ON DELETE CASCADE;

ALTER TABLE bookmark
    ADD CONSTRAINT fk_bookmark_app_user_id
    FOREIGN KEY (user_id)
    REFERENCES app_user (user_id)
    ON DELETE CASCADE;

ALTER TABLE bookmark
    ADD CONSTRAINT fk_bookmark_poi_id
    FOREIGN KEY (poi_id)
    REFERENCES poi (id);

ALTER TABLE bookmark
    ADD CONSTRAINT fk_bookmark_custom_category_user_scoped
    FOREIGN KEY (custom_category, user_id)
    REFERENCES bookmark_category (id, user_id)
    ON DELETE CASCADE;
