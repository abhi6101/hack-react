
const courses = [
    {
        id: 3,
        slug: "python-course",
        title: "Python for Beginners to Advanced",
        subtitle: "The most popular choice for beginners", // Placeholder or derived
        description: "Master Python with projects, data structures, and OOP. Your complete guide to becoming a Python pro.",
        image: "/images/python.jpeg", // Updated to match local image if possible or keep what was in Courses.jsx
        // Note: The HTML file for this (python-course.html) was NOT in the list of files I read. 
        // I only read android, data-science, full-stack, java. 
        // I will keep the basic info for this one, but I can't fill the details if the HTML was missing.
        // Wait, looking at file list in Step 329: python-course.html is NOT there. 
        // It might be a missing file or just not created in the original project. 
        // I will focus on the ones I have details for.
        duration: "6 Weeks",
        students: 2400,
        level: "Beginner",
        category: "programming",
        overview: "This course covers the fundamentals of Python programming...",
        whatYouWillLearn: ["Python Syntax", "Data Structures", "OOP", "File Handling"],
        curriculum: [
            { title: "Introduction", description: "Getting started with Python" }
        ]
    },
    {
        id: 6,
        slug: "android-course",
        title: "Modern Android Development",
        subtitle: "Build beautiful, high-performance Android apps with Kotlin and Jetpack Compose.",
        description: "Learn to develop native Android apps using Kotlin, Jetpack Compose, and modern architectural patterns.",
        image: "/images/android.jpeg",
        duration: "10 Weeks",
        students: 980,
        level: "Advanced",
        category: "mobile-dev",
        overview: "Step into the future of Android development. This course focuses on Google's recommended modern toolkit, teaching you how to build apps declaratively with Jetpack Compose and write safer, more concise code with Kotlin.",
        whatYouWillLearn: [
            "Fundamentals of the Kotlin programming language.",
            "Building beautiful UIs from scratch with Jetpack Compose.",
            "Managing app state and navigation in a declarative way.",
            "Integrating with REST APIs using Retrofit and Kotlin Coroutines.",
            "Local data persistence with Room database.",
            "Following modern MVVM architectural patterns."
        ],
        curriculum: [
            { title: "Weeks 1-2: Kotlin & Android Basics", description: "From variables and control flow in Kotlin to setting up your first Android project." },
            { title: "Weeks 3-5: Jetpack Compose UI", description: "Mastering layouts, state management, theming, and animations in Compose." },
            { title: "Weeks 6-8: Data & Networking", description: "Fetching data from the internet with Retrofit and storing it locally with Room." },
            { title: "Weeks 9-10: Final Project & Publishing", description: "Build a complete app and learn the steps to publish it on the Google Play Store." }
        ]
    },
    {
        id: 7,
        slug: "data-science-course",
        title: "Introduction to Data Science",
        subtitle: "Unlock the power of data by mastering analysis, visualization, and machine learning with Python.",
        description: "Explore the fundamentals of data analysis, visualization, and machine learning using Python libraries.",
        image: "/images/backgroundimage.jpg", // Using a generic image as placeholder if specific one not found, or original URL
        duration: "8 Weeks",
        students: 1800,
        level: "Beginner",
        category: "data-science",
        overview: "This course is your entry point into the exciting field of data science. You will learn the entire data science pipeline, from data collection and cleaning to analysis, visualization, and building your first predictive models using Python's powerful libraries.",
        whatYouWillLearn: [
            "Data manipulation and analysis using Pandas.",
            "Numerical computing and array operations with NumPy.",
            "Creating insightful data visualizations with Matplotlib and Seaborn.",
            "Understanding the fundamentals of machine learning.",
            "Building and evaluating regression and classification models with Scikit-learn.",
            "Communicating results and findings effectively."
        ],
        curriculum: [
            { title: "Weeks 1-2: Python & Data Wrangling", description: "Python basics for data science, plus cleaning and preparing data with NumPy and Pandas." },
            { title: "Weeks 3-4: Data Analysis & Visualization", description: "Exploratory data analysis (EDA) and creating compelling charts with Matplotlib/Seaborn." },
            { title: "Weeks 5-6: Machine Learning Foundations", description: "Introduction to supervised/unsupervised learning, and concepts like training and testing." },
            { title: "Weeks 7-8: Building Predictive Models", description: "Implementing linear regression and logistic regression models with Scikit-learn and a final capstone project." }
        ]
    },
    {
        id: 4,
        slug: "full-stack-course",
        title: "Full Stack Web Development",
        subtitle: "Master the MERN stack and build complete web applications from scratch.",
        description: "Build complete web applications from scratch using the MERN stack (MongoDB, Express, React, Node.js).",
        image: "/images/post2.jpeg",
        duration: "10 Weeks",
        students: 1500,
        level: "Intermediate",
        category: "web-dev",
        overview: "Dive into the world of full-stack development with the MERN stack (MongoDB, Express, React, Node.js). This project-based course is designed to take you from foundational concepts to deploying complex, data-driven web applications, making you a job-ready developer.",
        whatYouWillLearn: [
            "Building responsive user interfaces with React and modern CSS.",
            "Creating robust RESTful APIs with Node.js and Express.",
            "Designing and managing NoSQL databases with MongoDB.",
            "Implementing user authentication and authorization with JWT.",
            "State management in React with Redux Toolkit or Context API.",
            "Deploying full-stack applications to cloud platforms."
        ],
        curriculum: [
            { title: "Weeks 1-3: Frontend with React", description: "JSX, components, props, state, hooks, and client-side routing." },
            { title: "Weeks 4-6: Backend with Node.js & Express", description: "Building servers, routing, middleware, and creating a full REST API." },
            { title: "Weeks 7-8: Database with MongoDB", description: "NoSQL concepts, Mongoose ODM, data modeling, and performing CRUD operations." },
            { title: "Weeks 9-10: Integration & Deployment", description: "Connecting frontend to backend, JWT authentication, and deploying to the web." }
        ]
    },
    {
        id: 5,
        slug: "java-course",
        title: "Java & Spring Boot Framework",
        subtitle: "Build robust, enterprise-grade backend applications with the industry's leading Java framework.",
        description: "Dive deep into Java and the Spring Framework to build robust, enterprise-grade backend applications.",
        image: "/images/java.jpeg",
        duration: "8 Weeks",
        students: 1100,
        level: "Intermediate",
        category: "programming",
        overview: "Dive deep into Java and the Spring ecosystem. This course covers everything from core Java principles to building complex microservices with Spring Boot, preparing you for high-demand backend developer roles.",
        whatYouWillLearn: [
            "Core Java concepts including OOP, collections, and streams.",
            "Understanding the Spring Core container, Dependency Injection, and AOP.",
            "Building RESTful APIs with Spring MVC and handling web requests.",
            "Connecting to databases with Spring Data JPA and Hibernate.",
            "Securing applications with Spring Security.",
            "Developing and deploying microservices."
        ],
        curriculum: [
            { title: "Weeks 1-2: Core Java", description: "Mastering data structures, OOP principles, and the Java Collections Framework." },
            { title: "Weeks 3-4: Spring Core & MVC", description: "Dependency Injection, Aspect-Oriented Programming, and building your first web controllers." },
            { title: "Weeks 5-6: Data & Security", description: "Integrating databases with Spring Data JPA and implementing token-based security." },
            { title: "Weeks 7-8: Microservices", description: "Introduction to microservice architecture, building services, and preparing for deployment." }
        ]
    }
];

export default courses;
