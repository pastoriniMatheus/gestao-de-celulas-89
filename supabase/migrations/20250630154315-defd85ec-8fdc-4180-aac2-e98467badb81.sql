
-- Verificar a constraint atual e corrigir se necessário
-- Remover a constraint antiga se existir
ALTER TABLE teacher_schedules DROP CONSTRAINT IF EXISTS teacher_schedules_class_check;

-- Adicionar nova constraint com os valores corretos
ALTER TABLE teacher_schedules ADD CONSTRAINT teacher_schedules_class_check 
CHECK (class IN ('Berçário', 'Maternal', 'Jardim', 'Primários', 'Juniores', 'Pré-Adolescentes', 'Adolescentes'));
