pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Build') {
            steps {
                script {
                    echo 'Build Successful'
                }
            }
        }
    }

    post {
        success {
            mail to: 'kunalsikka10500@gmail.com',
            subject: 'Build Successful',
            body: 'Build was successful.'
        }
        failure {
            mail to: 'kunalsikka10500@gmail.com',
            subject: 'Build Failed',
            body: 'Build failed.'
        }
    }
}
