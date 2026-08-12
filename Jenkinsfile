pipeline {
    agent any

    parameters {
        booleanParam(name: 'RUN_LINT', defaultValue: true, description: 'Run code linting checks on frontend')
        booleanParam(name: 'BUILD_DOCKER', defaultValue: true, description: 'Build Docker containers')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy application using docker-compose')
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Tag for Docker images')
    }

    environment {
        PROJECT_NAME = 'humming-tone'
        FRONTEND_DIR = 'Humming_Tone'
        BACKEND_DIR  = 'Server'
        CI           = 'true'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage: Checkout Source Code ==='
                git branch: 'main', credentialsId: 'HummingTone', url: 'https://github.com/GowthamCD6/Humming-Tone.git'
            }
        }

        stage('Frontend - Dependencies & Lint') {
            when {
                expression { return params.RUN_LINT }
            }
            steps {
                dir("${env.FRONTEND_DIR}") {
                    echo '=== Stage: Installing Frontend Dependencies & Linting ==='
                    script {
                        if (isUnix()) {
                            sh 'npm ci || npm install'
                            sh 'npm run lint'
                        } else {
                            bat 'npm ci || npm install'
                            bat 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    echo '=== Stage: Building Frontend Production Bundle ==='
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Backend - Dependencies') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    echo '=== Stage: Installing Backend Dependencies ==='
                    script {
                        if (isUnix()) {
                            sh 'npm ci || npm install'
                        } else {
                            bat 'npm ci || npm install'
                        }
                    }
                }
            }
        }

        stage('Docker - Build Containers') {
            when {
                expression { return params.BUILD_DOCKER }
            }
            steps {
                echo '=== Stage: Building Docker Images ==='
                script {
                    if (isUnix()) {
                        sh 'docker compose build || docker-compose build'
                    } else {
                        bat 'docker compose build || docker-compose build'
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo '=== Stage: Deploying Containers ==='
                script {
                    if (isUnix()) {
                        sh 'docker compose down --remove-orphans || docker-compose down'
                        sh 'docker compose up -d --build || docker-compose up -d --build'
                    } else {
                        bat 'docker compose down --remove-orphans || docker-compose down'
                        bat 'docker compose up -d --build || docker-compose up -d --build'
                    }
                }
            }
        }
    }

    post {
        always {
            echo '=== Post Action: Cleaning up workspace ==='
            cleanWs deleteDirs: true, notFailBuild: true
        }
        success {
            echo "SUCCESS: Pipeline completed successfully for ${env.JOB_NAME} #${env.BUILD_NUMBER}!"
        }
        failure {
            echo "FAILURE: Pipeline failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}. Please check console output."
        }
    }
}
