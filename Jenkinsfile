pipeline {
    agent any

    environment {
        NODE_VERSION = '18'  // Specify your Node.js version here
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
                script {
                    def node = tool name: 'NodeJS', type: 'NodeJSInstallation'
                    env.PATH = "${node}/bin:${env.PATH}"
                }
                // Install project dependencies
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Run your tests
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                // Run build command if you have one
                sh 'npm run build'
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
            echo 'Build and tests passed!'
        }
        failure {
            // Notify on failure
            echo 'Build or tests failed!'
        }
    }
}