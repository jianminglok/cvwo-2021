--
-- PostgreSQL database dump
--

-- Dumped from database version 12.9 (Ubuntu 12.9-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 14.1

-- Started on 2022-01-16 00:17:10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 203 (class 1259 OID 16410)
-- Name: tasks; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE IF NOT EXISTS public.tasks (
    task_id uuid NOT NULL,
    name text NOT NULL,
    tags text[] NOT NULL,
    priority text NOT NULL,
    completed boolean NOT NULL,
    owner_id uuid NOT NULL,
    due_date timestamp with time zone NOT NULL,
    due_date_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    ts tsvector GENERATED ALWAYS AS (((setweight(to_tsvector('english'::regconfig, COALESCE(name, ''::text)), 'A'::"char") || setweight(array_to_tsvector(tags), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, COALESCE(priority, ''::text)), 'C'::"char"))) STORED
);


ALTER TABLE public.tasks OWNER TO backend;

--
-- TOC entry 202 (class 1259 OID 16386)
-- Name: users; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO backend;

--
-- TOC entry 2811 (class 2606 OID 16419)
-- Name: tasks cvwo_task; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT cvwo_task UNIQUE (task_id);


--
-- TOC entry 2807 (class 2606 OID 16397)
-- Name: users cvwo_users; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT cvwo_users UNIQUE (id, email);


--
-- TOC entry 2814 (class 2606 OID 16417)
-- Name: tasks task_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT task_pkey PRIMARY KEY (task_id);


--
-- TOC entry 2809 (class 2606 OID 16395)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2022-01-16 00:17:10

--
-- PostgreSQL database dump complete
--

