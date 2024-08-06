pipeline {
    agent any

    environment {
        NODE_VERSION = '22.5.1'  // Specify your Node.js version here
    }

    tools {
        nodejs "22.5.1"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Git
                git url: 'https://github.com/Kunal77689/blog-website.git', branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Use Node.js tool configured in Jenkins
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Run your tests
                sh 'npm test'
            }
        }

        stage('Archive Artifacts') {
            steps {
                // Archive build artifacts (if any)
                archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            // Clean up or notify after the pipeline run
            deleteDir()  // Replaces cleanWs
        }
        success {
            // Notify on success
            echo 'Tests passed!'
        }
        failure {
            // Notify on failure
            echo 'Tests failed!'
        }
    }
}
