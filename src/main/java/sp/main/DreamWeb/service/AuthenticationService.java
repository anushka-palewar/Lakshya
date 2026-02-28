package sp.main.DreamWeb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sp.main.DreamWeb.dto.AuthResponse;
import sp.main.DreamWeb.dto.LoginRequest;
import sp.main.DreamWeb.dto.RegisterRequest;
import sp.main.DreamWeb.model.User;
import sp.main.DreamWeb.repository.UserRepository;
import sp.main.DreamWeb.security.JwtService;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                if (repository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username already exists");
                }
                if (repository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                var user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .roles(request.getRoles() != null ? request.getRoles() : new HashSet<>())
                                .currentStreak(1)
                                .longestStreak(1)
                                .lastLoginDate(java.time.LocalDateTime.now())
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .username(user.getUsername())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .username(user.getUsername())
                                .build();
        }
}
