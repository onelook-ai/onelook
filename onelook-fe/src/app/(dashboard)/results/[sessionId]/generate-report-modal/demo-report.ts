export const demoReport =
  '##' +
  ' **Executive Summary**\n\n  - **Approach**\n    - This penetration test' +
  ' was conducted using a black-box approach, simulating the actions of an external attacker' +
  ' with no prior knowledge of the target environment. The assessment lasted for approximately 1 hour and utilized Core Impact penetration testing software.\n\n  - **Scope**\n' +
  '    - The scope of the assessment included a single IP address: 206.198.149.233. \n\n' +
  '  - **Assessment Overview and Recommendations**\n    - During the penetration test, multiple vulnerabilities were discovered on the target system (METASPLOITABLE3), leading to a full compromise of the host. The most critical finding was the successful exploitation' +
  ' of a Remote Desktop Protocol (RDP) vulnerability (CVE-1999-0503), allowing for remote code execution and the deployment of an agent on the target system. Additionally, default credentials were found to be valid for' +
  ' FTP and MySQL services. It is highly recommended to address these vulnerabilities immediately by applying necessary patches, enforcing strong password policies, and disabling unnecessary services.\n\n## **Network Penetration Test Assessment Summary**\n\n  - **Summary of Findings**\n    - During the course of testing, **[Pentesting Firm Name]** uncovered a' +
  ' total of 4 findings that pose a material risk to **[Company]**’s information systems. **[Pentesting Firm Name]** also identified 0 informational findings. Informational findings are observations for areas of improvement by the organization and do not represent security vulnerabilities on their own.\n\n## **Internal Network Compromise Walkthrough**' +
  '\n\n  - The penetration test began with an automated network information gathering phase, which identified the target host (206.198.149.233) and its open ports and services. \n  - A vulnerability scan revealed several potential weaknesses, including the critical RDP vulnerability (CVE-' +
  '1999-0503). \n  - An RDP Identity Verifier module was launched, which successfully exploited the vulnerability using the default credentials (username: vagrant, password: vagrant). \n  - This exploit allowed for the deployment of an agent on the target system, granting full control' +
  ' over the host. \n  - Further investigation revealed that default credentials were also valid for FTP (username: vagrant, password: vagrant) and MySQL (username: root, password: [BLANK]).\n\n## **Remediation Summary**\n\n  - **Short Term**\n    - **RDP Vulnerability (CVE' +
  '-1999-0503)** - Immediately apply the relevant security patch to address this critical vulnerability.\n    - **Default Credentials** - Change default credentials for all services, including FTP and MySQL. Enforce a strong password policy requiring complex passwords for all user accounts.\n\n  - **Medium Term' +
  '**\n    - **Vulnerability Management Program** - Implement a comprehensive vulnerability management program to proactively identify and remediate security weaknesses. This should include regular vulnerability scanning, timely patch management, and vulnerability prioritization based on risk.\n    - **Security Awareness Training** - Conduct regular security awareness training for all employees to educate' +
  ' them about common threats, such as phishing attacks and the importance of strong passwords.\n\n  - **Long Term**\n    - **Defense-in-Depth Strategy** - Implement a defense-in-depth security strategy that includes multiple layers of security controls, such as firewalls, intrusion detection systems, and endpoint protection' +
  ". This approach helps to mitigate the risk of a single point of failure.\n    - **Regular Penetration Testing** - Conduct regular penetration tests to assess the effectiveness of security controls and identify new vulnerabilities. This helps to ensure that the organization's security posture remains strong over time.\n\n## **Technical Findings Details**\n\n" +
  '  - **Finding 1: Remote Code Execution via RDP Vulnerability (CVE-1999-0503)**\n    - **CWE:** CWE-287 (Improper Authentication)\n    - **CVSS 3.1 Score:** 9.8 (Critical)\n    -' +
  ' **Description:** The target system is vulnerable to a critical remote code execution vulnerability in the Remote Desktop Protocol (CVE-1999-0503). This vulnerability allows an attacker to execute arbitrary code on the target system by sending specially crafted packets to the RDP service. The vulnerability is caused by improper authentication within' +
  ' the RDP protocol. An attacker can exploit this vulnerability without any user interaction.\n    - **Impact:** Successful exploitation of this vulnerability could allow an attacker to gain complete control over the target system. This could lead to data breaches, system outages, and other serious consequences.\n    - **Remediation:** Immediately apply the' +
  ' relevant security patch to address this vulnerability. Disable RDP if it is not required.\n\n  - **Finding 2: Default Credentials for FTP Service**\n    - **CWE:** CWE-798 (Use of Hard-coded Credentials)\n    - **CVSS 3.1 Score:** 7.' +
  '5 (High)\n    - **Description:** The FTP service on the target system is configured with default credentials (username: vagrant, password: vagrant). This allows an attacker to easily gain access to the FTP server and potentially sensitive data.\n    - **Impact:** An attacker could gain unauthorized access to sensitive' +
  ' data stored on the FTP server.\n    - **Remediation:** Change the default credentials for the FTP service. Enforce a strong password policy requiring complex passwords for all user accounts.\n\n  - **Finding 3: Default Credentials for MySQL Service**\n    - **CWE:** CWE-798 (Use' +
  ' of Hard-coded Credentials)\n    - **CVSS 3.1 Score:** 7.5 (High)\n    - **Description:** The MySQL service on the target system is configured with default credentials (username: root, password: [BLANK]). This allows an attacker to easily gain access to the MySQL' +
  ' database server and potentially sensitive data.\n    - **Impact:** An attacker could gain unauthorized access to sensitive data stored in the MySQL database.\n    - **Remediation:** Change the default credentials for the MySQL service. Enforce a strong password policy requiring complex passwords for all user accounts.\n\n  - **Finding ' +
  '4: Weak Password Policy**\n    - **CWE:** CWE-284 (Improper Access Control)\n    - **CVSS 3.1 Score:** 6.5 (Medium)\n    - **Description:** The target system does not enforce a strong password policy. This allows users to set' +
  ' weak and easily guessable passwords, increasing the risk of brute-force attacks.\n    - **Impact:** An attacker could gain unauthorized access to user accounts by guessing or cracking weak passwords.\n    - **Remediation:** Implement a strong password policy requiring complex passwords for all user accounts. This policy should include minimum password' +
  ' length, complexity requirements (uppercase, lowercase, numbers, and symbols), and password expiration rules.\n\n## **Appendices**\n\n  - **Appendix A - Finding Severities**\n    - **Critical (CVSS Score 9.0-10.0):** Exploitable vulnerabilities that allow for unauthorized remote code' +
  ' execution, complete system compromise, or significant data breaches.\n    - **High (CVSS Score 7.0-8.9):** Vulnerabilities that allow for unauthorized access to sensitive data, denial of service, or significant disruption of business operations.\n    - **Medium (CVSS Score 4' +
  '.0-6.9):** Vulnerabilities that could potentially lead to unauthorized access, data leakage, or minor disruption of business operations.\n    - **Low (CVSS Score 0.1-3.9):** Vulnerabilities that have minimal impact on security or business operations.\n\n  -' +
  ' **Appendix B - Exploited Hosts**\n    - 206.198.149.233 (METASPLOITABLE3)\n\n  - **Appendix C - Compromised Users**\n    - vagrant\n\n  - **Appendix D - Changes/Host Cleanup**\n    ' +
  '- No changes were made to the target system during the assessment. The deployed agent was removed after the completion of the penetration test.\n\n  - **Appendix E - Domain Password Review**\n    - Not applicable, as domain password analysis was not within the scope of this assessment.\n';