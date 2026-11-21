package com.school.admin.service;

import com.school.admin.dto.StudentRequest;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.model.SchoolClass;
import com.school.admin.model.Section;
import com.school.admin.model.Student;
import com.school.admin.repository.SchoolClassRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Tests")
class StudentServiceTest {

    @Mock private StudentRepository studentRepository;
    @Mock private SchoolClassRepository classRepository;
    @Mock private SectionRepository sectionRepository;

    @InjectMocks
    private StudentService studentService;

    private SchoolClass class1;
    private Section sectionA;
    private Student sampleStudent;

    @BeforeEach
    void setUp() {
        class1 = SchoolClass.builder().id(1L).className("Class 1").build();
        sectionA = Section.builder().id(1L).name("A").schoolClass(class1).build();

        sampleStudent = Student.builder()
                .id(1L)
                .admissionNumber("ADM26001")
                .name("Rahul Sharma")
                .gender("Male")
                .dateOfBirth(LocalDate.of(2010, 5, 15))
                .fatherName("Ramesh Sharma")
                .motherName("Sunita Sharma")
                .parentContact("9876500001")
                .schoolClass(class1)
                .section(sectionA)
                .admissionDate(LocalDate.of(2024, 6, 1))
                .active(true)
                .build();
    }

    // ── Admit Tests ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Admit student with valid data saves and returns student")
    void admit_validRequest_savesStudent() {
        StudentRequest request = new StudentRequest();
        request.setName("Priya Patel");
        request.setGender("Female");
        request.setDateOfBirth(LocalDate.of(2011, 3, 20));
        request.setClassId(1L);
        request.setSectionId(1L);
        request.setFatherName("Suresh Patel");
        request.setParentContact("9876500002");

        when(classRepository.findById(1L)).thenReturn(Optional.of(class1));
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(sectionA));
        when(studentRepository.count()).thenReturn(5L);
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(2L);
            return s;
        });

        Student result = studentService.admit(request);

        assertThat(result.getName()).isEqualTo("Priya Patel");
        assertThat(result.getSchoolClass()).isEqualTo(class1);
        assertThat(result.getSection()).isEqualTo(sectionA);
        assertThat(result.isActive()).isTrue();
        assertThat(result.getAdmissionNumber()).isNotBlank();
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Admit student with invalid class throws ResourceNotFoundException")
    void admit_invalidClass_throwsException() {
        StudentRequest request = new StudentRequest();
        request.setName("Test Student");
        request.setClassId(99L);
        request.setSectionId(1L);

        when(classRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.admit(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Class not found");

        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Admit student with invalid section throws ResourceNotFoundException")
    void admit_invalidSection_throwsException() {
        StudentRequest request = new StudentRequest();
        request.setName("Test Student");
        request.setClassId(1L);
        request.setSectionId(99L);

        when(classRepository.findById(1L)).thenReturn(Optional.of(class1));
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.admit(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Section not found");
    }

    @Test
    @DisplayName("Admit student uses today as admission date when not provided")
    void admit_noAdmissionDate_usesToday() {
        StudentRequest request = new StudentRequest();
        request.setName("No Date Student");
        request.setClassId(1L);
        request.setSectionId(1L);
        // admissionDate intentionally not set

        when(classRepository.findById(1L)).thenReturn(Optional.of(class1));
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(sectionA));
        when(studentRepository.count()).thenReturn(0L);
        when(studentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Student result = studentService.admit(request);

        assertThat(result.getAdmissionDate()).isEqualTo(LocalDate.now());
    }

    // ── GetById Tests ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Get student by valid ID returns student")
    void getById_existingId_returnsStudent() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(sampleStudent));

        Student result = studentService.getById(1L);

        assertThat(result.getName()).isEqualTo("Rahul Sharma");
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Get student by non-existent ID throws ResourceNotFoundException")
    void getById_nonExistentId_throwsException() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Student not found with id: 99");
    }

    // ── GetAll Tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Get all students returns full list")
    void getAll_returnsAllStudents() {
        Student s2 = Student.builder().id(2L).name("Priya Singh").build();
        when(studentRepository.findAll()).thenReturn(List.of(sampleStudent, s2));

        List<Student> result = studentService.getAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Student::getName)
                .containsExactly("Rahul Sharma", "Priya Singh");
    }

    @Test
    @DisplayName("Get all students returns empty list when no students exist")
    void getAll_noStudents_returnsEmptyList() {
        when(studentRepository.findAll()).thenReturn(List.of());

        List<Student> result = studentService.getAll();

        assertThat(result).isEmpty();
    }

    // ── GetByClass Tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Get students by class returns only active students")
    void getByClass_returnsActiveStudents() {
        when(studentRepository.findBySchoolClassIdAndActive(1L, true))
                .thenReturn(List.of(sampleStudent));

        List<Student> result = studentService.getByClass(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isTrue();
    }

    // ── Deactivate Tests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Deactivate student calls repository deleteById")
    void deactivate_existingStudent_deletesById() {
        studentService.deactivate(1L);

        verify(studentRepository).deleteById(1L);
    }

    // ── Update Tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Update student name updates and returns student")
    void update_validRequest_updatesStudent() {
        StudentRequest request = new StudentRequest();
        request.setName("Rahul Kumar");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(sampleStudent));
        when(studentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Student result = studentService.update(1L, request);

        assertThat(result.getName()).isEqualTo("Rahul Kumar");
        verify(studentRepository).save(sampleStudent);
    }

    @Test
    @DisplayName("Update student with non-existent ID throws ResourceNotFoundException")
    void update_nonExistentId_throwsException() {
        StudentRequest request = new StudentRequest();
        request.setName("Ghost");

        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.update(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
