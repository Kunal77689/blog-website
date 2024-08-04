pipeline{
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Build') {
            steps {
                echo 'Hello World'
            }
        }
    }
}