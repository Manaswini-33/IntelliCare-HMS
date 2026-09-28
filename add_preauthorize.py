import os
import re

controllers = {
    'patient/PatientController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'RECEPTIONIST\', \'DOCTOR\', \'PATIENT\')")',
    'doctor/DoctorController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'RECEPTIONIST\', \'PATIENT\')")',
    'appointment/AppointmentController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'RECEPTIONIST\', \'PATIENT\', \'DOCTOR\')")',
    'emergency/EmergencyController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'RECEPTIONIST\', \'DOCTOR\')")',
    'pharmacy/PharmacyController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'PHARMACIST\', \'DOCTOR\', \'PATIENT\')")',
    'laboratory/LaboratoryController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'LAB_TECHNICIAN\', \'DOCTOR\', \'PATIENT\')")',
    'billing/BillingController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'RECEPTIONIST\', \'PATIENT\', \'PHARMACIST\')")',
    'medicalrecord/MedicalRecordController.java': '@PreAuthorize("hasAnyRole(\'ADMIN\', \'DOCTOR\', \'PATIENT\')")',
}

base_path = 'src/main/java/com/hospital/management'

for path, auth_annotation in controllers.items():
    full_path = os.path.join(base_path, path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add import if missing
        if 'org.springframework.security.access.prepost.PreAuthorize' not in content:
            content = content.replace('import org.springframework.web.bind.annotation.*;', 
                                      'import org.springframework.web.bind.annotation.*;\nimport org.springframework.security.access.prepost.PreAuthorize;')
        
        # Add annotation before class if missing
        if '@PreAuthorize' not in content:
            content = re.sub(r'(@RestController\s*@RequestMapping.*?\s*)public class', r'\1' + auth_annotation + r'\npublic class', content)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
