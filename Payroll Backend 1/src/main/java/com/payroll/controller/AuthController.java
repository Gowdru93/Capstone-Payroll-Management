package com.payroll.controller;

import com.payroll.dto.AuthRequest;
import com.payroll.dto.AuthResponse;
import com.payroll.model.User;
import com.payroll.service.UserService;

import com.payroll.config.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5713")
public class AuthController {
	
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final UserService userService;

	public AuthController(AuthenticationManager authenticationManager, 
			JwtService jwtService, 
			UserService userService) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.userService = userService;
		
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(
						authRequest.getUsername(),
						authRequest.getPassword()
						)
				);

		User user = (User) authentication.getPrincipal();
		String jwtToken = jwtService.generateToken(user);

		AuthResponse authResponse = new AuthResponse(
				jwtToken,
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				user.getRole().name()
				);

		return ResponseEntity.ok(authResponse);
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest authRequest) {
		User user = userService.createUser(
				authRequest.getUsername(),
				authRequest.getEmail(),
				authRequest.getPassword(),
				User.Role.EMPLOYEE
				);

		String jwtToken = jwtService.generateToken(user);

		AuthResponse authResponse = new AuthResponse(
				jwtToken,
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				user.getRole().name()
				);

		return ResponseEntity.ok(authResponse);
	}

	@PostMapping("/register/admin")
	public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody AuthRequest authRequest) {
		User user = userService.createUser(
				authRequest.getUsername(),
				authRequest.getEmail(),
				authRequest.getPassword(),
				User.Role.ADMIN
				);

		String jwtToken = jwtService.generateToken(user);

		AuthResponse authResponse = new AuthResponse(
				jwtToken,
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				user.getRole().name()
				);

		return ResponseEntity.ok(authResponse);
	}

	@GetMapping("/me")
	public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User user) {
		// Use @AuthenticationPrincipal instead of Authentication parameter
		return ResponseEntity.ok(user);
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refreshToken(Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		String jwtToken = jwtService.generateToken(user);

		AuthResponse authResponse = new AuthResponse(
				jwtToken,
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				user.getRole().name()
				);

		return ResponseEntity.ok(authResponse);
	}

	

	  
}