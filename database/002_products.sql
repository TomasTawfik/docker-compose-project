--
-- PostgreSQL database dump
--

\restrict F8Q6vJi8eHPpbcDKzFxlETiz93gu7PMUnddQJRUQC5jint9b506E715co8iLS8v

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, category, image, created_at) FROM stdin;
1	Classic Burger	Juicy beef burger with fresh vegetables and special sauce.	8.99	Burgers	/images/burger.jpg	2026-10-04 16:21:27.506931
2	Italian Pizza	Fresh pizza with tomato sauce, mozzarella and herbs.	12.99	Pizza	/images/pizza.jpg	2026-10-04 16:21:27.506931
3	Crispy Chicken	Crispy chicken served with fresh vegetables and sauce.	10.99	Chicken	/images/chicken.jpg	2026-10-04 16:21:27.506931
4	Chicken Sandwich	Grilled chicken with lettuce, tomato and special sauce.	7.99	Sandwiches	/images/sandwich.jpg	2026-10-04 16:21:27.506931
\.


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict F8Q6vJi8eHPpbcDKzFxlETiz93gu7PMUnddQJRUQC5jint9b506E715co8iLS8v

