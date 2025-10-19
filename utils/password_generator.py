import string
import secrets
import re

class PasswordGenerator:
    """Generates secure random passwords with customizable options"""
    
    @staticmethod
    def generate(length: int = 16, 
                 use_uppercase: bool = True,
                 use_lowercase: bool = True,
                 use_digits: bool = True,
                 use_special: bool = True,
                 exclude_ambiguous: bool = False) -> str:
        """
        Generate a random password with specified criteria
        
        Args:
            length: Password length (minimum 8, maximum 128)
            use_uppercase: Include uppercase letters (A-Z)
            use_lowercase: Include lowercase letters (a-z)
            use_digits: Include digits (0-9)
            use_special: Include special characters (!@#$%^&*)
            exclude_ambiguous: Exclude ambiguous characters (i, l, 1, L, o, 0, O, etc.)
        
        Returns:
            Generated password string
        """
        # Validate length
        if length < 8:
            length = 8
        if length > 128:
            length = 128
        
        characters = ""
        
        if use_uppercase:
            chars = string.ascii_uppercase
            if exclude_ambiguous:
                chars = chars.replace('I', '').replace('O', '')
            characters += chars
        
        if use_lowercase:
            chars = string.ascii_lowercase
            if exclude_ambiguous:
                chars = chars.replace('i', '').replace('l', '').replace('o', '')
            characters += chars
        
        if use_digits:
            chars = string.digits
            if exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            characters += chars
        
        if use_special:
            # Use a safe set of special characters
            chars = "!@#$%^&*-_=+[]{}|;:,.<>?"
            characters += chars
        
        if not characters:
            characters = string.ascii_letters + string.digits
        
        # Generate password ensuring at least one character from each selected type
        password_chars = []
        
        if use_uppercase:
            chars = string.ascii_uppercase
            if exclude_ambiguous:
                chars = chars.replace('I', '').replace('O', '')
            password_chars.append(secrets.choice(chars))
        
        if use_lowercase:
            chars = string.ascii_lowercase
            if exclude_ambiguous:
                chars = chars.replace('i', '').replace('l', '').replace('o', '')
            password_chars.append(secrets.choice(chars))
        
        if use_digits:
            chars = string.digits
            if exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            password_chars.append(secrets.choice(chars))
        
        if use_special:
            chars = "!@#$%^&*-_=+[]{}|;:,.<>?"
            password_chars.append(secrets.choice(chars))
        
        # Fill remaining length with random characters
        for _ in range(length - len(password_chars)):
            password_chars.append(secrets.choice(characters))
        
        # Shuffle to avoid predictable patterns
        secrets.SystemRandom().shuffle(password_chars)
        
        return ''.join(password_chars)
    
    @staticmethod
    def check_strength(password: str) -> dict:
        """
        Analyze password strength and provide detailed feedback
        
        Args:
            password: Password to analyze
        
        Returns:
            Dictionary with strength score, level, and detailed feedback
        """
        score = 0
        feedback = []
        
        # Length checks
        if len(password) >= 8:
            score += 1
        else:
            feedback.append("Password should be at least 8 characters long")
        
        if len(password) >= 12:
            score += 1
        
        if len(password) >= 16:
            score += 1
        
        # Character type checks
        has_upper = any(c.isupper() for c in password)
        if has_upper:
            score += 1
        else:
            feedback.append("Add uppercase letters (A-Z)")
        
        has_lower = any(c.islower() for c in password)
        if has_lower:
            score += 1
        else:
            feedback.append("Add lowercase letters (a-z)")
        
        has_digit = any(c.isdigit() for c in password)
        if has_digit:
            score += 1
        else:
            feedback.append("Add numbers (0-9)")
        
        has_special = any(c in string.punctuation for c in password)
        if has_special:
            score += 1
        else:
            feedback.append("Add special characters (!@#$%^&*)")
        
        # Pattern checks
        has_sequential = bool(re.search(r'(.)\1{2,}', password))
        if has_sequential:
            feedback.append("Avoid repeating characters")
            score = max(0, score - 1)
        
        has_keyboard_pattern = bool(re.search(r'(qwerty|asdfgh|zxcvbn|123456|abcdef)', password.lower()))
        if has_keyboard_pattern:
            feedback.append("Avoid keyboard patterns")
            score = max(0, score - 1)
        
        # Strength levels
        strength_levels = {
            0: "Very Weak",
            1: "Weak",
            2: "Fair",
            3: "Good",
            4: "Strong",
            5: "Very Strong",
            6: "Excellent",
            7: "Perfect"
        }
        
        # Color coding for UI
        color_map = {
            "Very Weak": "red",
            "Weak": "orange",
            "Fair": "yellow",
            "Good": "lime",
            "Strong": "green",
            "Very Strong": "green",
            "Excellent": "green",
            "Perfect": "green"
        }
        
        strength = strength_levels.get(score, "Unknown")
        
        return {
            'score': score,
            'max_score': 7,
            'strength': strength,
            'color': color_map.get(strength, 'gray'),
            'feedback': feedback,
            'percentage': int((score / 7) * 100)
        }
    
    @staticmethod
    def estimate_crack_time(password: str) -> dict:
        """
        Estimate how long it would take to crack the password
        
        Args:
            password: Password to analyze
        
        Returns:
            Dictionary with estimated crack time
        """
        # Calculate character space
        char_space = 0
        if any(c.isupper() for c in password):
            char_space += 26
        if any(c.islower() for c in password):
            char_space += 26
        if any(c.isdigit() for c in password):
            char_space += 10
        if any(c in string.punctuation for c in password):
            char_space += 32
        
        if char_space == 0:
            char_space = 94  # Default ASCII printable
        
        # Total possible combinations
        total_combinations = char_space ** len(password)
        
        # Assume 1 billion guesses per second (modern GPU)
        guesses_per_second = 1_000_000_000
        
        # Average time to crack (half of total time)
        seconds_to_crack = (total_combinations / 2) / guesses_per_second
        
        # Convert to human-readable format
        time_units = [
            ('year', 31536000),
            ('month', 2592000),
            ('week', 604800),
            ('day', 86400),
            ('hour', 3600),
            ('minute', 60),
            ('second', 1)
        ]
        
        for unit, seconds in time_units:
            if seconds_to_crack >= seconds:
                value = seconds_to_crack / seconds
                return {
                    'time': f"{value:.1f} {unit}{'s' if value > 1 else ''}",
                    'seconds': seconds_to_crack,
                    'unit': unit
                }
        
        return {
            'time': 'Less than a second',
            'seconds': seconds_to_crack,
            'unit': 'second'
        }


class PasswordValidator:
    """Validates passwords against common security standards"""
    
    COMMON_PASSWORDS = {
        'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey',
        'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
        'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', 'superman',
        'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja',
        'mustang', 'password123', '123123', '1234567890', 'admin'
    }
    
    @staticmethod
    def is_common_password(password: str) -> bool:
        """Check if password is in common passwords list"""
        return password.lower() in PasswordValidator.COMMON_PASSWORDS
    
    @staticmethod
    def validate(password: str) -> dict:
        """
        Comprehensive password validation
        
        Args:
            password: Password to validate
        
        Returns:
            Dictionary with validation results
        """
        issues = []
        
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        
        if PasswordValidator.is_common_password(password):
            issues.append("This password is too common")
        
        if not any(c.isupper() for c in password):
            issues.append("Password must contain uppercase letters")
        
        if not any(c.islower() for c in password):
            issues.append("Password must contain lowercase letters")
        
        if not any(c.isdigit() for c in password):
            issues.append("Password must contain numbers")
        
        if not any(c in string.punctuation for c in password):
            issues.append("Password must contain special characters")
        
        return {
            'is_valid': len(issues) == 0,
            'issues': issues
        }
