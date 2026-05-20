-- Caché de análisis de inteligencia estratégica (DeepSeek).
-- Ejecutar en la base CUANTIVA / esquema Centinela.

IF NOT EXISTS (
  SELECT 1
  FROM sys.tables t
  INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
  WHERE s.name = N'Centinela' AND t.name = N'InteligenciaAnalisis'
)
BEGIN
  CREATE TABLE [Centinela].[InteligenciaAnalisis] (
    analisis_id       INT IDENTITY(1,1) NOT NULL,
    region            NVARCHAR(50)      NOT NULL,
    periodo           NVARCHAR(10)      NOT NULL,
    data_hash         CHAR(64)          NOT NULL,
    modelo            NVARCHAR(100)     NOT NULL,
    payload_json      NVARCHAR(MAX)     NOT NULL,
    menciones_count   INT               NOT NULL CONSTRAINT DF_Inteligencia_Menciones DEFAULT (0),
    alertas_count     INT               NOT NULL CONSTRAINT DF_Inteligencia_Alertas DEFAULT (0),
    generado_en       DATETIME2(3)      NOT NULL CONSTRAINT DF_Inteligencia_Generado DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_InteligenciaAnalisis PRIMARY KEY CLUSTERED (analisis_id),
    CONSTRAINT UQ_Inteligencia_Region_Periodo UNIQUE (region, periodo),
    CONSTRAINT CK_Inteligencia_PayloadJson CHECK (ISJSON(payload_json) = 1)
  );

  CREATE INDEX IX_Inteligencia_GeneradoEn
    ON [Centinela].[InteligenciaAnalisis] (generado_en DESC);
END
GO
