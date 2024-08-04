pipeline{
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Build') {
            steps {
                {
                    echo 'Build Sucessful'
                }
            }
        }
    }

    post {
        sucess {
            mail to: 'kunalsikka10500@gmail.com',
            subject: 'Build successfull',
            body: 'Build success'
        }
        failure {
            mail to: 'kunalsikka10500@gmail.com',
            subject: 'Build Failed',
            body: 'Build Fail'
        }
    }
}