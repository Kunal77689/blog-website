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
            emailext(
                to: 'kunalsikka10500@gmail.com',
                subject: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Good news! The build was successful.\n\n" +
                      "Job: ${env.JOB_NAME}\n" +
                      "Build Number: ${env.BUILD_NUMBER}\n" +
                      "Build URL: ${env.BUILD_URL}\n" +
                      "Git Commit: ${env.GIT_COMMIT}\n" +
                      "Build Duration: ${currentBuild.durationString}\n" +
                      "Built by: ${env.BUILD_USER}\n"
            )
        }
        failure {
            // Notify on failure
            echo 'Tests failed!'
            emailext(
                to: 'kunalsikka10500@gmail.com',
                subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Unfortunately, the build has failed.\n\n" +
                      "Job: ${env.JOB_NAME}\n" +
                      "Build Number: ${env.BUILD_NUMBER}\n" +
                      "Build URL: ${env.BUILD_URL}\n" +
                      "Git Commit: ${env.GIT_COMMIT}\n" +
                      "Build Duration: ${currentBuild.durationString}\n" +
                      "Built by: ${env.BUILD_USER}\n"
            )
        }
    }
}
