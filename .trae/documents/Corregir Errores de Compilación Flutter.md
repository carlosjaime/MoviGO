## Plan de Corrección de Errores de Compilación

### **Errores Críticos a Corregir:**

1. **Import faltante de debugPrint** en múltiples archivos:
   - Agregar `import 'package:flutter/foundation.dart';` a todos los archivos que usan debugPrint
   - Archivos afectados: auth.dart, payment.dart, location.dart, driver.dart, ride.dart

2. **Referencias no definidas en AuthService**:
   - Corregir `_storage` reference en signOut() method
   - Implementar método getToken() faltante
   - Verificar inicialización de FlutterSecureStorage

3. **API obsoletas**:
   - Reemplazar todos los `withOpacity()` con `withValues()`
   - Actualizar color references en UI components

4. **Imports sin usar**:
   - Limpiar imports no utilizados
   - Optimizar imports con package: syntax

### **Orden de Ejecución:**
1. Primero corregir todos los errores críticos (debugPrint, referencias faltantes)
2. Luego actualizar APIs obsoletas
3. Finalmente limpiar advertencias de imports
4. Probar compilación con `flutter analyze`

### **Archivos que necesitan corrección:**
- lib/services/auth.dart (errores críticos)
- lib/services/payment.dart (debugPrint)
- lib/services/location.dart (debugPrint)
- lib/services/driver.dart (debugPrint)
- lib/services/ride.dart (debugPrint)
- Varios componentes UI (withOpacity → withValues)

¿Procedo con las correcciones?