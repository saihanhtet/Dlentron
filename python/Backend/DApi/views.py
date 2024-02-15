from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .custom_validations import custom_validation, validate_email, validate_password
from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWTAuthentication


class JWTAuthentication(BaseJWTAuthentication):
    """
    Custom JWT authentication class.
    This class extends the base JWTAuthentication provided by rest_framework_simplejwt.
    It adds support for checking access tokens stored in cookies if not found in the Authorization header.
    """

    def authenticate(self, request):
        # Check the Authorization header first
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return user, validated_token

        # If no token in the Authorization header, check cookies
        else:
            raw_token = request.COOKIES.get('access_token')
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                user = self.get_user(validated_token)
                return user, validated_token

        return None


def generate_tokens(user):
    """
    Generate access and refresh tokens for a given user.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class check_token(APIView):
    """
    Check access token from a user
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """Check the token from request"""
        return Response({'message': 'token alive'}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """
    View for user registration.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        """ User Register post method"""
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            serializer = UserSerializer(user)
            if user:
                return Response({'user': serializer.data, 'message': "register successful"}, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLogout(APIView):
    """
    View for user logout.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        """ User Logout method"""
        try:
            logout(request)
            response = Response(
                {'message': 'logout successfully'}, status=status.HTTP_200_OK)

            # Delete cookies upon logout
            response.delete_cookie('refresh_token')
            response.delete_cookie('access_token')

            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    View for user login.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        """ User Login post method"""
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            tokens = generate_tokens(user)
            serializer = UserSerializer(user)
            response = Response({'user': serializer.data,
                                'message': "login successful"}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=tokens['refresh'],
                httponly=True,
                secure=True,  # Adjust based on your HTTPS setup
                samesite='None',  # Adjust based on your cross-origin requirements
                domain='127.0.0.1',  # Adjust based on your domain or use IP address
                path='/',
            )
            response.set_cookie(
                key='access_token',
                value=tokens['access'],
                httponly=True,
                secure=True,  # Adjust based on your HTTPS setup
                samesite='None',  # Adjust based on your cross-origin requirements
                domain='127.0.0.1',  # Adjust based on your domain or use IP address
                path='/',
            )
            return response


class UserView(APIView):
    """
    View for getting user details.
    """
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """ User Detail get method """
        print('User:', request.user)
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data, 'message': 'Details successful'}, status=status.HTTP_200_OK)
