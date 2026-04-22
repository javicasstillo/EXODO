# ÉXODO — Sistema de Gestión de iPhones

Sistema para administrar la compra y venta de iPhones usados.

## Módulos

- **Panel** — Dashboard con KPIs: stock, ventas, ingresos y ganancia neta
- **Stock** — ABM de equipos con foto, IMEI, batería, costo y precio de venta
- **Compradores** — Registro de clientes con historial de compras
- **Ventas** — Registro de ventas con forma de pago, cuotas, garantía y exportación de recibo PDF
- **Gastos** — Control de egresos operativos por categoría
- **Estadísticas** — Análisis de modelos más vendidos, ingresos por mes, formas de pago y resumen financiero

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase
1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitá **Authentication → Email/Password**
3. Creá una base de datos en **Firestore**
4. Copiá `.env.example` como `.env` y completá tus credenciales

```bash
cp .env.example .env
```

### 3. Crear usuario administrador
En Firebase Console → Authentication → Add user: cargá tu email y contraseña.

### 4. Reglas de Firestore
En Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Levantar en desarrollo
```bash
npm run dev
```

### 6. Build para producción
```bash
npm run build
```

## Colecciones en Firestore

| Colección  | Descripción                  |
|------------|------------------------------|
| `phones`   | Stock de equipos             |
| `buyers`   | Compradores / clientes       |
| `sales`    | Ventas registradas           |
| `expenses` | Gastos operativos            |
