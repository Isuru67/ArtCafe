# Art Cafe - Social Media Platform for Artists

Art Cafe is a full-stack social media application designed for artists to share their artwork, connect with others, and engage through comments and likes.

## Project Structure

```
Art_Cafe/
│
├── backend/         # Spring Boot backend application
│   ├── src/         # Java source code
│   └── pom.xml      # Maven dependencies
│
└── frontend/        # React.js frontend application
    ├── public/      # Public assets
    └── src/         # React source code
```

## Prerequisites

Before running the application, ensure you have the following installed:

- Java JDK 17 or higher
- Maven 3.6+
- Node.js 14+ and npm 6+
- Git (optional)

## Running the Backend

1. Open a terminal and navigate to the backend directory:

```bash
cd c:\Users\Isuru\Desktop\Art_Cafe\backend
```

2. Build the application using Maven:

```bash
mvn clean install
```

3. Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend server will start on http://localhost:8080. You can access the H2 database console at http://localhost:8080/h2-console with the following configuration:

- JDBC URL: `jdbc:h2:mem:artcafedb`
- Username: `sa`
- Password: `password`

## Running the Frontend

1. Open a new terminal and navigate to the frontend directory:

```bash
cd c:\Users\Isuru\Desktop\Art_Cafe\frontend
```

2. Install the required npm packages:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```

The frontend application will start on http://localhost:3000 and should automatically open in your default web browser.

## Default Accounts

The application does not come with pre-configured accounts. You'll need to register a new user via the signup form.

## API Documentation

The backend exposes the following main API endpoints:

- Authentication: `/api/auth/login`, `/api/auth/signup`
- Posts: `/api/posts`
- Comments: `/api/posts/{postId}/comments`
- User profile: `/api/users/profile`

## Features

- User authentication (signup, login, profile management)
- Create, view, update, and delete posts with images
- Comment on posts
- Like/unlike posts
- View user profiles

## Technologies Used

### Backend
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- H2 Database (development)
- Lombok

### Frontend
- React.js
- React Router
- Axios
- Bootstrap
- JWT Authentication

## Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Ensure Java 17+ is installed and configured
   - Check if port 8080 is already in use by another application
   - Verify the H2 database configuration in `application.properties`
   - If you see "No plugin found for prefix 'spring-boot'", ensure you're in the backend directory and the Spring Boot Maven plugin is configured in pom.xml:
     ```xml
     <build>
         <plugins>
             <plugin>
                 <groupId>org.springframework.boot</groupId>
                 <artifactId>spring-boot-maven-plugin</artifactId>
                 <version>3.2.0</version> <!-- Use appropriate version -->
             </plugin>
         </plugins>
     </build>
     ```

2. **Frontend won't start**:
   - Ensure Node.js and npm are properly installed
   - Check if port 3000 is already in use
   - Run `npm install` again to ensure all dependencies are installed

3. **Authentication issues**:
   - Verify that JWT secret key in `application.properties` is properly configured
   - Check browser console for CORS-related errors

4. **Image upload not working**:
   - Verify that the upload directories exist or can be created
   - Check file size limits in `application.properties`

### Contact

If you encounter any issues or have questions, please create a GitHub issue or contact the project maintainers.

## License

This project is licensed under the MIT License.
