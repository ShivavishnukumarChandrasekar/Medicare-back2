package com.medicare.backend.services;

import com.medicare.backend.dto.LoginRequest;
import com.medicare.backend.dto.LoginResponse;
import com.medicare.backend.models.User;
import com.medicare.backend.models.SecurityAlert;
import com.medicare.backend.models.Doctor;
import com.medicare.backend.repositories.UserRepository;
import com.medicare.backend.repositories.SecurityAlertRepository;
import com.medicare.backend.repositories.DoctorRepository;
import com.medicare.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityAlertRepository securityAlertRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder encoder;

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("deactivated".equals(user.getStatus())) {
            SecurityAlert alert = new SecurityAlert();
            alert.setUserId(user.getId());
            alert.setType("unauthorized_login");
            alert.setMessage("Deactivated user " + user.getName() + " (" + user.getEmail() + ") attempted to access the portal.");
            securityAlertRepository.save(alert);
            throw new RuntimeException("Your Access has been Terminate from Login In . Kindly Contact the Admin Department");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        String jwt = jwtUtil.generateToken(authentication);

        String userId = user.getId();
        if ("doctor".equals(user.getRole())) {
            Optional<Doctor> doctor = doctorRepository.findByUserId(user.getId());
            if (doctor.isPresent()) {
                userId = doctor.get().getId();
            }
        }

        return new LoginResponse(jwt, userId, user.getRole(), user.getName());
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
    }
}
