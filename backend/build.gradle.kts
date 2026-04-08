plugins {
    java
    id("org.springframework.boot") version "4.0.5"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.tictactoe"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // Cucumber
    testImplementation(platform("io.cucumber:cucumber-bom:7.18.1"))
    testImplementation("io.cucumber:cucumber-java")
    testImplementation("io.cucumber:cucumber-spring")
    testImplementation("io.cucumber:cucumber-junit-platform-engine")
}

// Unit tests: exclude the Cucumber engine so only JUnit Jupiter tests run
tasks.test {
    useJUnitPlatform {
        excludeEngines("cucumber")
    }
}

// BDD tests: run only the Cucumber engine
val cucumberTest by tasks.registering(Test::class) {
    description = "Runs Cucumber BDD tests"
    group = "verification"
    testClassesDirs = sourceSets.test.get().output.classesDirs
    classpath = sourceSets.test.get().runtimeClasspath
    useJUnitPlatform {
        includeEngines("cucumber")
    }
    failOnNoDiscoveredTests = false
    shouldRunAfter(tasks.test)
}
