-- ** Database generated with pgModeler (PostgreSQL Database Modeler).
-- ** pgModeler version: 1.2.3
-- ** PostgreSQL version: 18.0
-- ** Project Site: pgmodeler.io
-- ** Model Author: Christoph Chen

SET search_path TO pg_catalog,public;
-- ddl-end --

-- ======================================================
-- Step 1: Create all sequences WITHOUT OWNED BY
--         (tables don't exist yet; OWNED BY needs them)
-- ======================================================

-- object: public.poi_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.poi_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.poi_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.todo_list_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.todo_list_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.todo_list_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.todo_item_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.todo_item_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.todo_item_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.trip_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.trip_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.trip_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.trip_day_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.trip_day_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.trip_day_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.itinerary_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.itinerary_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.itinerary_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.bookmark_category_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.bookmark_category_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.bookmark_category_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.bookmark_id_seq | type: SEQUENCE --
CREATE SEQUENCE public.bookmark_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START WITH 1
	CACHE 1
	NO CYCLE;
-- ddl-end --
ALTER SEQUENCE public.bookmark_id_seq OWNER TO postgres;
-- ddl-end --

-- ======================================================
-- Step 2: Create all tables
--         (sequences already exist, DEFAULT nextval works)
-- ======================================================

-- object: public.app_user | type: TABLE --
-- DROP TABLE IF EXISTS public.app_user CASCADE;
CREATE TABLE public.app_user (
	user_id uuid NOT NULL,
	user_name character varying(50) NOT NULL,
	email character varying(255) NOT NULL,
	password_hash character varying(255) NOT NULL,
	CONSTRAINT pk_app_user PRIMARY KEY (user_id),
	CONSTRAINT uq_app_user_email UNIQUE (email)
);
-- ddl-end --
ALTER TABLE public.app_user OWNER TO postgres;
-- ddl-end --

-- object: public.poi | type: TABLE --
-- DROP TABLE IF EXISTS public.poi CASCADE;
CREATE TABLE public.poi (
	id bigint NOT NULL DEFAULT nextval('public.poi_id_seq'::regclass),
	places_id text NOT NULL,
	CONSTRAINT pk_poi PRIMARY KEY (id),
	CONSTRAINT uq_poi_places_id UNIQUE (places_id)
);
-- ddl-end --
ALTER TABLE public.poi OWNER TO postgres;
-- ddl-end --

-- object: public.todo_list | type: TABLE --
-- DROP TABLE IF EXISTS public.todo_list CASCADE;
CREATE TABLE public.todo_list (
	id bigint NOT NULL DEFAULT nextval('public.todo_list_id_seq'::regclass),
	user_id uuid NOT NULL,
	start_date date,
	end_date date,
	CONSTRAINT pk_todo_list PRIMARY KEY (id),
	CONSTRAINT ck_todo_list_start_date_lte_end_date CHECK (start_date IS NULL
OR end_date IS NULL
OR start_date <= end_date)
);
-- ddl-end --
ALTER TABLE public.todo_list OWNER TO postgres;
-- ddl-end --

-- object: public.todo_item | type: TABLE --
-- DROP TABLE IF EXISTS public.todo_item CASCADE;
CREATE TABLE public.todo_item (
	id bigint NOT NULL DEFAULT nextval('public.todo_item_id_seq'::regclass),
	todo_list_id bigint NOT NULL,
	poi_id bigint NOT NULL,
	priority text NOT NULL DEFAULT 'medium',
	CONSTRAINT pk_todo_item PRIMARY KEY (id),
	CONSTRAINT ck_todo_item_priority CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])))
);
-- ddl-end --
ALTER TABLE public.todo_item OWNER TO postgres;
-- ddl-end --

-- object: public.trip | type: TABLE --
-- DROP TABLE IF EXISTS public.trip CASCADE;
CREATE TABLE public.trip (
	id bigint NOT NULL DEFAULT nextval('public.trip_id_seq'::regclass),
	user_id uuid NOT NULL,
	title character varying(255) NOT NULL,
	duration integer NOT NULL,
	start_date date,
	CONSTRAINT pk_trip PRIMARY KEY (id),
	CONSTRAINT ck_trip_duration CHECK (((duration >= 1) AND (duration <= 15)))
);
-- ddl-end --
ALTER TABLE public.trip OWNER TO postgres;
-- ddl-end --

-- object: public.trip_day | type: TABLE --
-- DROP TABLE IF EXISTS public.trip_day CASCADE;
CREATE TABLE public.trip_day (
	id bigint NOT NULL DEFAULT nextval('public.trip_day_id_seq'::regclass),
	trip_id bigint NOT NULL,
	day_number integer NOT NULL,
	CONSTRAINT pk_trip_day PRIMARY KEY (id),
	CONSTRAINT uq_trip_day_trip_id_day_number UNIQUE (trip_id,day_number)
);
-- ddl-end --
ALTER TABLE public.trip_day OWNER TO postgres;
-- ddl-end --

-- object: public.itinerary | type: TABLE --
-- DROP TABLE IF EXISTS public.itinerary CASCADE;
CREATE TABLE public.itinerary (
	id bigint NOT NULL DEFAULT nextval('public.itinerary_id_seq'::regclass),
	trip_day_id bigint NOT NULL,
	poi_id bigint NOT NULL,
	visit_order integer NOT NULL,
	travel_method text NOT NULL DEFAULT 'TRAVEL_MODE_UNSPECIFIED',
	CONSTRAINT pk_itinerary PRIMARY KEY (id),
	CONSTRAINT uq_itinerary_trip_day_id_visit_order UNIQUE (trip_day_id,visit_order),
	CONSTRAINT ck_itinerary_travel_method CHECK ((travel_method = ANY (ARRAY['TRAVEL_MODE_UNSPECIFIED'::text, 'DRIVE'::text, 'BICYCLE'::text, 'WALK'::text, 'TWO_WHEELER'::text, 'TRANSIT'::text])))
);
-- ddl-end --
ALTER TABLE public.itinerary OWNER TO postgres;
-- ddl-end --

-- object: public.bookmark_category | type: TABLE --
-- DROP TABLE IF EXISTS public.bookmark_category CASCADE;
CREATE TABLE public.bookmark_category (
	id bigint NOT NULL DEFAULT nextval('public.bookmark_category_id_seq'::regclass),
	user_id uuid NOT NULL,
	category_name character varying(20) NOT NULL,
	CONSTRAINT pk_bookmark_category PRIMARY KEY (id),
	CONSTRAINT uq_bookmark_category_user_id_category_name UNIQUE (user_id,category_name),
	CONSTRAINT uq_bookmark_category_id_user_id UNIQUE (id,user_id)
);
-- ddl-end --
ALTER TABLE public.bookmark_category OWNER TO postgres;
-- ddl-end --

-- object: public.bookmark | type: TABLE --
-- DROP TABLE IF EXISTS public.bookmark CASCADE;
CREATE TABLE public.bookmark (
	id bigint NOT NULL DEFAULT nextval('public.bookmark_id_seq'::regclass),
	user_id uuid NOT NULL,
	poi_id bigint NOT NULL,
	custom_category bigint,
	CONSTRAINT pk_bookmark PRIMARY KEY (id),
	CONSTRAINT uq_bookmark_user_id_poi_id UNIQUE (user_id,poi_id)
);
-- ddl-end --
ALTER TABLE public.bookmark OWNER TO postgres;
-- ddl-end --

-- ======================================================
-- Step 3: Bind sequences to their columns via OWNED BY
--         (tables now exist, so this succeeds)
-- ======================================================

ALTER SEQUENCE public.poi_id_seq OWNED BY public.poi.id;
-- ddl-end --
ALTER SEQUENCE public.todo_list_id_seq OWNED BY public.todo_list.id;
-- ddl-end --
ALTER SEQUENCE public.todo_item_id_seq OWNED BY public.todo_item.id;
-- ddl-end --
ALTER SEQUENCE public.trip_id_seq OWNED BY public.trip.id;
-- ddl-end --
ALTER SEQUENCE public.trip_day_id_seq OWNED BY public.trip_day.id;
-- ddl-end --
ALTER SEQUENCE public.itinerary_id_seq OWNED BY public.itinerary.id;
-- ddl-end --
ALTER SEQUENCE public.bookmark_category_id_seq OWNED BY public.bookmark_category.id;
-- ddl-end --
ALTER SEQUENCE public.bookmark_id_seq OWNED BY public.bookmark.id;
-- ddl-end --

-- ======================================================
-- Step 4: Add all foreign key constraints
-- ======================================================

-- object: fk_todo_list_app_user_id | type: CONSTRAINT --
-- ALTER TABLE public.todo_list DROP CONSTRAINT IF EXISTS fk_todo_list_app_user_id CASCADE;
ALTER TABLE public.todo_list ADD CONSTRAINT fk_todo_list_app_user_id FOREIGN KEY (user_id)
REFERENCES public.app_user (user_id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_todo_item_todo_list_id | type: CONSTRAINT --
-- ALTER TABLE public.todo_item DROP CONSTRAINT IF EXISTS fk_todo_item_todo_list_id CASCADE;
ALTER TABLE public.todo_item ADD CONSTRAINT fk_todo_item_todo_list_id FOREIGN KEY (todo_list_id)
REFERENCES public.todo_list (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_todo_item_poi_id | type: CONSTRAINT --
-- ALTER TABLE public.todo_item DROP CONSTRAINT IF EXISTS fk_todo_item_poi_id CASCADE;
ALTER TABLE public.todo_item ADD CONSTRAINT fk_todo_item_poi_id FOREIGN KEY (poi_id)
REFERENCES public.poi (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_trip_app_user_id | type: CONSTRAINT --
-- ALTER TABLE public.trip DROP CONSTRAINT IF EXISTS fk_trip_app_user_id CASCADE;
ALTER TABLE public.trip ADD CONSTRAINT fk_trip_app_user_id FOREIGN KEY (user_id)
REFERENCES public.app_user (user_id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_trip_day_trip_id | type: CONSTRAINT --
-- ALTER TABLE public.trip_day DROP CONSTRAINT IF EXISTS fk_trip_day_trip_id CASCADE;
ALTER TABLE public.trip_day ADD CONSTRAINT fk_trip_day_trip_id FOREIGN KEY (trip_id)
REFERENCES public.trip (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_itinerary_trip_day_id | type: CONSTRAINT --
-- ALTER TABLE public.itinerary DROP CONSTRAINT IF EXISTS fk_itinerary_trip_day_id CASCADE;
ALTER TABLE public.itinerary ADD CONSTRAINT fk_itinerary_trip_day_id FOREIGN KEY (trip_day_id)
REFERENCES public.trip_day (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_itinerary_poi_id | type: CONSTRAINT --
-- ALTER TABLE public.itinerary DROP CONSTRAINT IF EXISTS fk_itinerary_poi_id CASCADE;
ALTER TABLE public.itinerary ADD CONSTRAINT fk_itinerary_poi_id FOREIGN KEY (poi_id)
REFERENCES public.poi (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_bookmark_category_app_user_id | type: CONSTRAINT --
-- ALTER TABLE public.bookmark_category DROP CONSTRAINT IF EXISTS fk_bookmark_category_app_user_id CASCADE;
ALTER TABLE public.bookmark_category ADD CONSTRAINT fk_bookmark_category_app_user_id FOREIGN KEY (user_id)
REFERENCES public.app_user (user_id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_bookmark_app_user_id | type: CONSTRAINT --
-- ALTER TABLE public.bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_app_user_id CASCADE;
ALTER TABLE public.bookmark ADD CONSTRAINT fk_bookmark_app_user_id FOREIGN KEY (user_id)
REFERENCES public.app_user (user_id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_bookmark_poi_id | type: CONSTRAINT --
-- ALTER TABLE public.bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_poi_id CASCADE;
ALTER TABLE public.bookmark ADD CONSTRAINT fk_bookmark_poi_id FOREIGN KEY (poi_id)
REFERENCES public.poi (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: fk_bookmark_custom_category_user_scoped | type: CONSTRAINT --
-- ALTER TABLE public.bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_custom_category_user_scoped CASCADE;
ALTER TABLE public.bookmark ADD CONSTRAINT fk_bookmark_custom_category_user_scoped FOREIGN KEY (custom_category,user_id)
REFERENCES public.bookmark_category (id,user_id) MATCH SIMPLE
ON DELETE SET NULL ON UPDATE NO ACTION;
-- ddl-end --
