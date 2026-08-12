package com.hospital.management.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.hospital.management..*Service.*(..)) || execution(* com.hospital.management..*Controller.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;
            
            // Mask sensitive methods (e.g., authentication) from argument output
            logger.info("[AOP LOG] {}.{}() | Status: SUCCESS | Execution Time: {} ms", className, methodName, executionTime);
            return result;
        } catch (Throwable ex) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("[AOP LOG] {}.{}() | Status: FAILED | Exception: {} | Execution Time: {} ms",
                    className, methodName, ex.getMessage(), executionTime);
            throw ex;
        }
    }
}
