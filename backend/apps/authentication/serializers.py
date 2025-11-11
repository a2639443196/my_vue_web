from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .authentication import generate_jwt_token

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer."""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'phone', 'email')

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("密码不匹配")

        # Validate password strength
        validate_password(attrs['password'])

        return attrs

    def create(self, validated_data):
        """Create new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        # Create user profile
        from apps.users.models import UserProfile
        UserProfile.objects.create(user=user)

        return user


class UserLoginSerializer(serializers.Serializer):
    """User login serializer."""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        """Validate credentials."""
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = User.objects.filter(username=username).first()

            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError("账户已被禁用")

                # Update last login
                from django.utils import timezone
                user.last_login_at = timezone.now()
                user.save(update_fields=['last_login_at'])

                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError("用户名或密码错误")
        else:
            raise serializers.ValidationError("必须提供用户名和密码")


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer."""
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'avatar', 'avatar_url',
                 'first_name', 'last_name', 'date_joined', 'last_login_at')
        read_only_fields = ('id', 'username', 'date_joined', 'last_login_at')

    def get_avatar_url(self, obj):
        """Get avatar URL."""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        """Validate password change."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("新密码不匹配")

        validate_password(attrs['new_password'])

        return attrs

    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("旧密码错误")
        return value