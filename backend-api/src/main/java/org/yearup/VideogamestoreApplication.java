package org.yearup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VideogamestoreApplication
{
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(VideogamestoreApplication.class);
        app.run(args);
    }
}
