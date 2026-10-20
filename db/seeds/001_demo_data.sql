INSERT INTO customers (document_number, full_name, email) VALUES
('00000001', 'Juan Perez', 'juan@isur.edu.pe'),
('00000002', 'Ana Gomez', 'ana@isur.edu.pe')
ON CONFLICT DO NOTHING;
