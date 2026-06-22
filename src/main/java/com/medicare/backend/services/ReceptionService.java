package com.medicare.backend.services;

import com.medicare.backend.dto.WalkInRequest;
import com.medicare.backend.dto.WalkInResponse;
import com.medicare.backend.models.*;
import com.medicare.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.*;

@Service
public class ReceptionService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    private static final Map<String, Double> PRICING = Map.of(
            "CONSULTATION", 500.0,
            "MEDICINE_BASE", 100.0,
            "LAB_TEST_BASE", 350.0);

    public WalkInResponse registerWalkIn(WalkInRequest request) {
        // Find a default doctor for walk-ins (e.g., d4 from original JS)
        Doctor doctor = doctorRepository.findById("d4").orElseGet(() -> {
            List<Doctor> doctors = doctorRepository.findAll();
            return doctors.isEmpty() ? null : doctors.get(0);
        });

        if (doctor != null && "offline".equals(doctor.getStatus())) {
            throw new RuntimeException("Doctor is currently offline and cannot accept walk-ins.");
        }

        String patientId = "MED-WALK-" + (System.currentTimeMillis() + "").substring(7);
        String token = "T-" + (100 + new Random().nextInt(900));

        // Create dummy password for walk-in patient (they won't login usually)
        Patient patient = new Patient();
        patient.setUserId("walk-in-" + System.currentTimeMillis());
        patient.setPatientId(patientId);
        patient.setName(request.getName());
        patient.setPhone(request.getPhone());
        // dob logic simplified
        patient.setImageUrl("https://ui-avatars.com/api/?name=" + request.getName());

        patientRepository.save(patient);

        Appointment appointment = new Appointment();
        appointment.setAppointmentId("APT-WALK-" + System.currentTimeMillis());
        appointment.setDoctorId(doctor != null ? doctor.getId() : "unknown");
        appointment.setPatientId(patient.getId());
        appointment.setDate(new Date());
        appointment.setSlot("Walk-in");
        appointment.setToken(token);
        appointment.setStatus("upcoming");

        if (request.getVitals() != null) {
            Appointment.Vitals vitals = new Appointment.Vitals();
            vitals.setBp(request.getVitals().get("bp"));
            vitals.setPulse(request.getVitals().get("pulse"));
            vitals.setTemp(request.getVitals().get("temp"));
            appointment.setVitals(vitals);
        }

        appointmentRepository.save(appointment);

        return new WalkInResponse(patientId, token, appointment);
    }

    public List<Appointment> getQueue() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date start = cal.getTime();

        cal.add(Calendar.DAY_OF_MONTH, 1);
        Date end = cal.getTime();

        return appointmentRepository.findByDateBetweenAndStatusNot(start, end, "cancelled");
    }

    public Map<String, Object> getStats() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date start = cal.getTime();

        cal.add(Calendar.DAY_OF_MONTH, 1);
        Date end = cal.getTime();

        List<Appointment> appointments = appointmentRepository.findByDateBetweenAndStatusNot(start, end, "cancelled");
        long waiting = appointments.stream().filter(a -> "upcoming".equals(a.getStatus())).count();

        List<Invoice> invoices = invoiceRepository.findByCreatedAtBetweenAndStatus(start, end, "paid");
        double collections = invoices.stream().mapToDouble(Invoice::getTotal).sum();

        return Map.of(
                "patientsToday", appointments.size(),
                "waiting", waiting,
                "collections", collections);
    }

    public Invoice generateInvoice(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        List<Invoice.InvoiceItem> items = new ArrayList<>();
        items.add(new Invoice.InvoiceItem("Consultation Fee", PRICING.get("CONSULTATION")));

        // Simplified medicine/lab logic from original JS
        if (appointment.getDiagnosis() != null && appointment.getDiagnosis().getMedicines() != null) {
            // Assume simple medicine logic for now as medicines are stored as string in
            // Appointment model
            items.add(new Invoice.InvoiceItem("Medicines", PRICING.get("MEDICINE_BASE")));
        }

        if (appointment.getLabTests() != null) {
            for (Appointment.LabTest test : appointment.getLabTests()) {
                items.add(new Invoice.InvoiceItem("Lab Test: " + test.getTestName(), PRICING.get("LAB_TEST_BASE")));
            }
        }

        double total = items.stream().mapToDouble(Invoice.InvoiceItem::getAmount).sum();

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-" + (System.currentTimeMillis() + "").substring(7));
        invoice.setAppointmentId(appointment.getId());
        invoice.setPatientId(appointment.getPatientId());
        invoice.setItems(items);
        invoice.setTotal(total);
        invoice.setStatus("pending");

        return invoice;
    }

    public Invoice saveInvoice(Invoice invoice) {
        invoice.setStatus("paid");
        Invoice saved = invoiceRepository.save(invoice);

        // Update appointment status
        Optional<Appointment> appointment = appointmentRepository.findById(invoice.getAppointmentId());
        if (appointment.isPresent()) {
            appointment.get().setStatus("settled");
            appointmentRepository.save(appointment.get());
        }

        return saved;
    }
}
