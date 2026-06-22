package com.medicare.backend.services;

import com.medicare.backend.dto.AdminStats;
import com.medicare.backend.models.*;
import com.medicare.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SecurityAlertRepository securityAlertRepository;

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    public AdminStats getStats() {
        List<Invoice> invoices = invoiceRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();
        List<Inventory> inventory = inventoryRepository.findAll();
        List<Doctor> doctors = doctorRepository.findAll();

        double totalRevenue = invoices.stream().mapToDouble(Invoice::getTotal).sum();
        long pharmacyAlerts = inventory.stream().filter(item -> item.getStock() <= item.getMinStock()).count();
        long uniquePatients = appointments.stream().map(Appointment::getPatientId).distinct().count();

        // Revenue timeline logic simplified
        Map<String, Double> timelineMap = new TreeMap<>();
        for (Invoice inv : invoices) {
            String date = inv.getCreatedAt() != null ? inv.getCreatedAt().toLocalDate().toString() : "Unknown";
            timelineMap.put(date, timelineMap.getOrDefault(date, 0.0) + inv.getTotal());
        }

        List<AdminStats.RevenueTimelineItem> timeline = timelineMap.entrySet().stream()
                .map(e -> new AdminStats.RevenueTimelineItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        AdminStats stats = new AdminStats();
        stats.setTotalRevenue(totalRevenue);
        stats.setRevenueGrowth(15.4); // Mock
        stats.setTotalPatients(uniquePatients);
        stats.setPatientGrowth(8.2); // Mock
        stats.setActiveDoctors((long) doctors.size());
        stats.setPharmacyAlerts(pharmacyAlerts);
        stats.setRevenueTimeline(timeline);

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll().stream()
                .peek(u -> u.setPassword(null))
                .collect(Collectors.toList());
    }

    public User updateUser(String id, User updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getName() != null)
            user.setName(updates.getName());
        if (updates.getStatus() != null)
            user.setStatus(updates.getStatus());
        if (updates.getRole() != null)
            user.setRole(updates.getRole());

        return userRepository.save(user);
    }

    public List<Inventory> getInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory createInventoryItem(Inventory item) {
        return inventoryRepository.save(item);
    }

    public Inventory updateInventoryItem(String id, Inventory updates) {
        Inventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (updates.getName() != null)
            item.setName(updates.getName());
        if (updates.getStock() != null)
            item.setStock(updates.getStock());
        if (updates.getPrice() != null)
            item.setPrice(updates.getPrice());

        return inventoryRepository.save(item);
    }

    public void deleteInventoryItem(String id) {
        inventoryRepository.deleteById(id);
    }

    public void adjustStock(String id, int delta) {
        Inventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        item.setStock(Math.max(0, item.getStock() + delta));
        inventoryRepository.save(item);
    }

    public List<SecurityAlert> getSecurityAlerts() {
        return securityAlertRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ContactRequest> getContactRequests() {
        return contactRequestRepository.findAllByOrderByCreatedAtDesc();
    }
}
